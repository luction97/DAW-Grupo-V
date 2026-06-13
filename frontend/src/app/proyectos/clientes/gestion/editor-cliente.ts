import { Component, computed, effect, inject, input, InputSignal, model, ModelSignal, Signal, signal, WritableSignal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ActualizarCliente } from "./actualizar-cliente";
import { EstadoCliente } from "../estado-cliente";
import { EditorClienteApi } from "./editor-cliente-api";
import { CrearCliente } from "./crear-cliente";
import { ClienteItem } from "../listado/cliente-item";

@Component({
    selector: "app-editor-cliente",
    templateUrl: "./editor-cliente.html",
    styleUrls: ["./editor-cliente.css"],
    imports: [DialogModule, InputTextModule, SelectModule, ButtonModule, ReactiveFormsModule]
})
export class EditorCliente {

    visible: ModelSignal<boolean> = model(false);

    clienteActual: ModelSignal<ClienteItem | null> = model<ClienteItem | null>(null);

    readonly estados: WritableSignal<string[]> = signal(Object.values(EstadoCliente));

    private readonly messageService: MessageService = inject(MessageService);

    private readonly EditorClienteApi = inject(EditorClienteApi);

    readonly proyectoId: InputSignal<number | null> = input<number | null>(null);

    header: Signal<string> = computed(() => {
        if (this.clienteActual()) {
            return "Editar cliente";
        }
        return "Crear cliente";
    });

    readonly form: FormGroup = new FormGroup({
        nombre: new FormControl("", [Validators.required]),
        estado: new FormControl(null)
    });

    constructor() {
        effect(() => {
            if (this.clienteActual()) {
                this.form.patchValue({
                    nombre: this.clienteActual()?.nombre,
                    estado: this.clienteActual()?.estado
                });
            }
            else {
                this.form.reset({
                    nombre: "",
                    estado: null
                });
            }
        });
    }

    cerrar(): void {
        this.clienteActual.set(null);
        this.form.reset({
            nombre: "",
            estado: null
        });
        this.visible.set(false);
    }

    enviarCliente(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete todos los campos requeridos.' });
            return;
        }

        const formRawValue = this.form.getRawValue();

        if (this.clienteActual()) {
            const dto: ActualizarCliente = {
                nombre: formRawValue.nombre,
                estado: formRawValue.estado
            };
            this.EditorClienteApi.actualizarCliente(this.clienteActual()?.id!, dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado correctamente.' });
                    this.cerrar();
                },
                error: (err) => {
                    let detail: string = "";
                    if (err.error.statusCode >= 400 && err.error.statusCode < 500) {
                        detail = err.error.message
                    }
                    else {
                        detail = "Ha ocurrido un error al actualizar el cliente"
                    }
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
                }
            });
        } else {
            const dto: CrearCliente = {
                nombre: formRawValue.nombre
            };
            this.EditorClienteApi.crearCliente(dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado correctamente.' });
                    this.cerrar();
                },
                error: (err) => {
                    let detail: string = "";
                    if (err.error.statusCode >= 400 && err.error.statusCode < 500) {
                        detail = err.error.message
                    }
                    else {
                        detail = "Ha ocurrido un error al crear el cliente"
                    }
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
                }
            });
        }
    }

}