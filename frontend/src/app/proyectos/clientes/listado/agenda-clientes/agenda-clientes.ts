import { Component, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { InputTextModule } from "primeng/inputtext";
import { CardModule } from "primeng/card";
import { Router } from "@angular/router";
import { ClientesApi } from "../../../clientes/listado/clientes-api"; 
import { ClienteItem } from "../../../clientes/listado/cliente-item";

@Component({
  selector: "app-agenda-clientes",
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, CardModule],
  templateUrl: "./agenda-clientes.html"
})
export class AgendaClientes implements OnInit {
  private readonly messageService: MessageService = inject(MessageService);
  private readonly clientesApi: ClientesApi = inject(ClientesApi);
  private readonly router: Router = inject(Router);
  clientes: WritableSignal<ClienteItem[]> = signal([]);
  clienteEditandoId: WritableSignal<number | null> = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.clientesApi.buscarClientes().subscribe({
      next: (data) => {
        const mapeados = data.map(c => {
          const guardado = localStorage.getItem(`contacto_cliente_${c.id}`);
          if (guardado) {
            const { telefono, email } = JSON.parse(guardado);
            return { ...c, telefono, email };
          }
          return { ...c, telefono: '', email: '' };
        });
        this.clientes.set(mapeados);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la agenda' });
      }
    });
  }

  activarEdicion(id: number): void {
    this.clienteEditandoId.set(id);
  }

  guardarContacto(cliente: ClienteItem): void {
    const payload = { telefono: cliente.telefono || '', email: cliente.email || '' };
    localStorage.setItem(`contacto_cliente_${cliente.id}`, JSON.stringify(payload));
    this.clienteEditandoId.set(null);
    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Contacto actualizado localmente' });
  }
  volverAProyectos(): void {
    this.router.navigate(['/proyectos']);
  }
}
