import { Component, computed, effect, inject, model, ModelSignal, Signal, signal, WritableSignal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { EstadoProyecto } from "../estado-proyecto";
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProyectoItem } from "../listado/proyecto-item";
import { MessageService, PrimeTemplate } from "primeng/api";
import { EditorProyectoApi } from "./editor-proyecto-api";
import { CrearProyecto } from "./crear-proyecto";
import { ButtonModule } from "primeng/button";
import { ActualizarProyecto } from "./actualizar-proyecto";
import { ClienteItem } from "../clientes/listado/cliente-item";
import { ClientesApi } from "../clientes/listado/clientes-api";
import { EditorCliente } from "../clientes/gestion/editor-cliente";
import { EstadoCliente } from "../clientes/estado-cliente";

@Component({
    selector: "app-editor-proyecto",
    templateUrl: "./editor-proyecto.html",
    styleUrls: ["./editor-proyecto.css"],
    imports: [DialogModule, InputTextModule, SelectModule, ButtonModule, ReactiveFormsModule, EditorCliente, PrimeTemplate]
})
export class EditorProyecto {

    visible: ModelSignal<boolean> = model(false);

    readonly crearClienteVisible: WritableSignal<boolean> = signal<boolean>(false);

    private clientesAntes: number = 0;
    private ultimoProyectoId: number | null = null;

    proyectoActual: ModelSignal<ProyectoItem | null> = model<ProyectoItem | null>(null);

    readonly estados: WritableSignal<string[]> = signal(Object.values(EstadoProyecto));

    private readonly messageService: MessageService = inject(MessageService);

    private readonly EditorProyectoApi = inject(EditorProyectoApi);

    readonly clientes: WritableSignal<ClienteItem[]> = signal<ClienteItem[]>([]);

    private readonly ClientesApi: ClientesApi = inject(ClientesApi);

    header: Signal<string> = computed(() => {
        if (this.proyectoActual()) {
            return "Editar proyecto";
        }
        return "Crear proyecto";
    });

    readonly form: FormGroup = new FormGroup({
        nombre: new FormControl("", [Validators.required]),
        cliente: new FormControl(null),
        estado: new FormControl(null)
    });

    constructor() {
        effect(() => {
            const proyecto = this.proyectoActual();
            if (proyecto) {
                if (proyecto.id !== this.ultimoProyectoId) {
                    this.ultimoProyectoId = proyecto.id;
                    this.form.patchValue({
                        nombre: proyecto.nombre ?? "",
                        cliente: proyecto.cliente ?? null,
                        estado: proyecto.estado ?? null
                    });
                }
            }
            else {
                this.ultimoProyectoId = null;
                this.form.reset({
                    nombre: "",
                    cliente: null,
                    estado: EstadoProyecto.ACTIVO
                });
            }
        });

        effect(() => {
            if (!this.crearClienteVisible()) {
                this.cargarClientes();
            }
        });

    }

    ngOnInit(): void {
        this.cargarClientes();
    }

    cargarClientes(): void {
        this.ClientesApi.buscarClientes(EstadoCliente.ACTIVO).subscribe({
            next: (data) => {
                const clientesViejos = this.clientes();
                this.clientes.set(data);
                if (data.length > this.clientesAntes) {
                    const nuevos = data.filter(c => !clientesViejos.find(oc => oc.id === c.id));
                    if (nuevos.length === 1) {
                        this.form.patchValue({ cliente: nuevos[0] });
                    }
                }
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los clientes' });
            }
        });
    }

    cerrar(): void {
        this.proyectoActual.set(null);
        this.visible.set(false);
    }

    enviarProyecto(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete todos los campos requeridos.' });
            return;
        }

        const formRawValue = this.form.getRawValue();

        if (this.proyectoActual()) {
            const dto: ActualizarProyecto = {
                nombre: formRawValue.nombre,
                idCliente: formRawValue.cliente ? formRawValue.cliente.id : null,
                estado: formRawValue.estado
            };
            this.EditorProyectoApi.actualizarProyecto(this.proyectoActual()?.id!, dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto actualizado correctamente.' });
                    this.cerrar();
                },
                error: (err) => {
                    let detail: string = "";
                    if (err.error.statusCode >= 400 && err.error.statusCode < 500) {
                        detail = err.error.message
                    }
                    else {
                        detail = "Ha ocurrido un error al actualizar el proyecto"
                    }
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
                }
            });
        } else {
            const dto: CrearProyecto = {
                nombre: formRawValue.nombre,
                idCliente: formRawValue.cliente ? formRawValue.cliente.id : null
            };
            this.EditorProyectoApi.crearProyecto(dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado correctamente.' });
                    this.cerrar();
                },
                error: (err) => {
                    let detail: string = "";
                    if (err.error.statusCode >= 400 && err.error.statusCode < 500) {
                        detail = err.error.message
                    }
                    else {
                        detail = "Ha ocurrido un error al crear el proyecto"
                    }
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: detail });
                }
            });
        }
    }

    nuevoCliente(): void {
        this.clientesAntes = this.clientes().length;
        this.crearClienteVisible.set(true);
    }

}