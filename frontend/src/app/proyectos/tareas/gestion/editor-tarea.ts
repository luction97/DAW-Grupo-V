import { Component, computed, effect, inject, input, InputSignal, model, ModelSignal, Signal, signal, WritableSignal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from "primeng/api";
import { EditorTareaApi } from "./editor-tarea-api";
import { ButtonModule } from "primeng/button";
import { TareaItem } from "../listado/tarea-item";
import { EstadoTarea } from "../estado-tarea";
import { ActualizarTarea } from "./actualizar-tarea";
import { CrearTarea } from "./crear-tarea";

@Component({
    selector: "app-editor-tarea",
    templateUrl: "./editor-tarea.html",
    styleUrls: ["./editor-tarea.css"],
    imports: [DialogModule, InputTextModule, SelectModule, ButtonModule, ReactiveFormsModule]
})
export class EditorTarea {

    visible: ModelSignal<boolean> = model(false);

    tareaActual: ModelSignal<TareaItem | null> = model<TareaItem | null>(null);

    readonly estados: WritableSignal<string[]> = signal(Object.values(EstadoTarea));

    private readonly messageService: MessageService = inject(MessageService);

    private readonly EditorTareaApi = inject(EditorTareaApi);

    readonly proyectoId: InputSignal<number | null> = input<number | null>(null);

    header: Signal<string> = computed(() => {
        if (this.tareaActual()) {
            return "Editar tarea";
        }
        return "Crear tarea";
    });

    readonly form: FormGroup = new FormGroup({
        descripcion: new FormControl("", [Validators.required]),
        estado: new FormControl(null)
    });

    constructor() {
        effect(() => {
            if (this.tareaActual()) {
                this.form.patchValue({
                    descripcion: this.tareaActual()?.descripcion,
                    estado: this.tareaActual()?.estado
                });
            }
            else {
                this.form.reset({
                    descripcion: "",
                    estado: null
                });
            }
        });
    }

    cerrar(): void {
        this.tareaActual.set(null);
        this.form.reset({
            descripcion: "",
            estado: null
        });
        this.visible.set(false);
    }

    enviarTarea(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete todos los campos requeridos.' });
            return;
        }

        const formRawValue = this.form.getRawValue();

        if (this.tareaActual()) {
            const dto: ActualizarTarea = {
                descripcion: formRawValue.descripcion,
                estado: formRawValue.estado
            };
            this.EditorTareaApi.actualizarTarea(this.proyectoId(), this.tareaActual()?.id!, dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea actualizada correctamente.' });
                    this.cerrar();
                },
                error: (err) => {
                    let detail: string = "";
                    if (err.error.statusCode >= 400 && err.error.statusCode < 500) {
                        detail = err.error.message
                    }
                    else {
                        detail = "Ha ocurrido un error al actualizar la tarea"
                    }
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
                }
            });
        } else {
            const dto: CrearTarea = {
                descripcion: formRawValue.descripcion
            };
            this.EditorTareaApi.crearTarea(this.proyectoId(), dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea creada correctamente.' });
                    this.cerrar();
                },
                error: (err) => {
                    let detail: string = "";
                    if (err.error.statusCode >= 400 && err.error.statusCode < 500) {
                        detail = err.error.message
                    }
                    else {
                        detail = "Ha ocurrido un error al crear la tarea"
                    }
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
                }
            });
        }
    }

}