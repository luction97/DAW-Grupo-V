import { Component, computed, effect, inject, model, ModelSignal, Signal, signal, WritableSignal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { EstadosProyectosEnum } from "../estados-proyectos-enum";
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ListProyectoDTO } from "../listado/list-proyecto-dto";
import { MessageService } from "primeng/api";
import { GestionProyectoApiClient } from "./gestion-proyecto-api-client";
import { CreateProyectoDTO } from "./create-proyecto-dto";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { UpdateProyectoDto } from "./update-proyecto-dto";
import { ListClienteDTO } from "../clientes/listado/list-cliente-dto";
import { ClientesListadoApiClient } from "../clientes/listado/clientes-listado-api-client";
import { GestionCliente } from "../clientes/gestion/gestion-cliente";
import { EstadosClientesEnum } from "../clientes/estados-clientes-enum";

@Component({
    selector: "app-gestion-proyecto",
    templateUrl: "./gestion-proyecto.html",
    styleUrls: ["./gestion-proyecto.css"],
    imports: [DialogModule, InputTextModule, SelectModule, ButtonModule, TooltipModule, ReactiveFormsModule, GestionCliente]
})
export class GestionProyecto {

    visible: ModelSignal<boolean> = model(false);

    readonly dialogCrearClienteVisible: WritableSignal<boolean> = signal<boolean>(false);

    private clientesAntes: number = 0;

    proyectoSeleccionado: ModelSignal<ListProyectoDTO | null> = model<ListProyectoDTO | null>(null);

    readonly estados: WritableSignal<string[]> = signal(Object.values(EstadosProyectosEnum));

    private readonly messageService: MessageService = inject(MessageService);

    private readonly gestionProyectoApiClient = inject(GestionProyectoApiClient);

    readonly clientes: WritableSignal<ListClienteDTO[]> = signal<ListClienteDTO[]>([]);

    private readonly clientesListadoApiClient: ClientesListadoApiClient = inject(ClientesListadoApiClient);

    header: Signal<string> = computed(() => {
        if (this.proyectoSeleccionado()) {
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
            if (this.proyectoSeleccionado()) {
                this.form.patchValue({
                    nombre: this.proyectoSeleccionado()?.nombre,
                    cliente: this.proyectoSeleccionado()?.cliente,
                    estado: this.proyectoSeleccionado()?.estado
                });
            }
            else {
                this.form.reset({
                    nombre: "",
                    cliente: null,
                    estado: EstadosProyectosEnum.ACTIVO
                });
            }
        });

        effect(() => {
            if (!this.dialogCrearClienteVisible()) {
                this.refrescarClientes();
            }
        });

    }

    ngOnInit(): void {
        this.refrescarClientes();
    }

    refrescarClientes(): void {
        this.clientesListadoApiClient.buscarClientes(EstadosClientesEnum.ACTIVO).subscribe({
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

    cerrarDialog(): void {
        this.proyectoSeleccionado.set(null);
        this.visible.set(false);
    }

    guardarProyecto(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete todos los campos requeridos.' });
            return;
        }

        const formRawValue = this.form.getRawValue();

        if (this.proyectoSeleccionado()) {
            const dto: UpdateProyectoDto = {
                nombre: formRawValue.nombre,
                idCliente: formRawValue.cliente ? formRawValue.cliente.id : null,
                estado: formRawValue.estado
            };
            this.gestionProyectoApiClient.actualizarProyecto(this.proyectoSeleccionado()?.id!, dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto actualizado correctamente.' });
                    this.cerrarDialog();
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
            const dto: CreateProyectoDTO = {
                nombre: formRawValue.nombre,
                idCliente: formRawValue.cliente ? formRawValue.cliente.id : null
            };
            this.gestionProyectoApiClient.crearProyecto(dto).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado correctamente.' });
                    this.cerrarDialog();
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

    abrirCrearCliente(): void {
        this.clientesAntes = this.clientes().length;
        this.dialogCrearClienteVisible.set(true);
    }

}