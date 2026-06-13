import { Component, effect, inject, model, ModelSignal, OnInit, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { ClientesApi } from "./clientes-api";
import { ClienteItem } from "./cliente-item";
import { DialogModule } from "primeng/dialog";
import { EditorCliente } from "../gestion/editor-cliente";

@Component({
  selector: "app-lista-clientes",
  templateUrl: "./lista-clientes.html",
  styleUrls: ["./lista-clientes.css"],
  imports: [ButtonModule, TagModule, TooltipModule, DialogModule, EditorCliente]
})
export class ListaClientes implements OnInit {

  private readonly messageService: MessageService = inject(MessageService);

  visible: ModelSignal<boolean> = model(false);

  private readonly ClientesApi: ClientesApi = inject(ClientesApi);

  clientes: WritableSignal<ClienteItem[]> = signal([]);

  dialogoVisible: WritableSignal<boolean> = signal(false);

  clienteActual: WritableSignal<ClienteItem | null> = signal<ClienteItem | null>(null);

  constructor() {
    effect(() => {
      if (!this.dialogoVisible()) {
        this.cargarClientes();
      }
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.ClientesApi.buscarClientes().subscribe({
      next: (data) => {
        this.clientes.set(data);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los clientes' });
      }
    });
  }

  nuevoCliente(): void {
    this.dialogoVisible.set(true);
  }

  modificarCliente(cliente: ClienteItem): void {
    this.dialogoVisible.set(true);
    this.clienteActual.set(cliente);
  }

  mostrarDialogo(): void {
    this.dialogoVisible.set(true);
  }

}