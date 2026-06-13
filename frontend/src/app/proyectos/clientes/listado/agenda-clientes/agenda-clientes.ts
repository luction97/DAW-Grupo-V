import { Component, inject, OnInit, signal, computed, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ClientesApi } from "../../../clientes/listado/clientes-api"; 
import { ClienteItem } from "../../../clientes/listado/cliente-item";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { CardModule } from "primeng/card";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-agenda-clientes",
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TableModule, CardModule],
  templateUrl: "./agenda-clientes.html"
})
export class AgendaClientes implements OnInit {
  private readonly messageService: MessageService = inject(MessageService);
  private readonly clientesApi: ClientesApi = inject(ClientesApi);
  private readonly router: Router = inject(Router);

  universoClientes: WritableSignal<ClienteItem[]> = signal([]);
  ocultarIncompletos: WritableSignal<boolean> = signal(false);
  clienteEditandoId: WritableSignal<number | null> = signal(null);
  
  // Almacena el criterio de filtrado por nombre proveniente de la búsqueda avanzada
  filtroNombreBuscador: WritableSignal<string> = signal("");

  ngOnInit(): void {
    // Intercepta el parámetro antes de estructurar la carga de datos
    const nombreGuardado = sessionStorage.getItem('filtro_cliente_agenda');
    if (nombreGuardado) {
      this.filtroNombreBuscador.set(nombreGuardado);
      sessionStorage.removeItem('filtro_cliente_agenda');
    }
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
          return { ...c, telefono: c.telefono || '', email: c.email || '' };
        });

        // Ordenamiento alfabético garantizado por nombre del cliente
        const ordenados = mapeados.sort((a, b) => {
          const nameA = a.nombre ? a.nombre.toLowerCase() : '';
          const nameB = b.nombre ? b.nombre.toLowerCase() : '';
          return nameA.localeCompare(nameB);
        });

        this.universoClientes.set(ordenados);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la agenda' });
      }
    });
  }

  // Filtrado reactivo unificado basado en prioridades de estado
  clientes = computed(() => {
    const lista = this.universoClientes();
    const filtroNombre = this.filtroNombreBuscador().toLowerCase().trim();

    // Prioridad 1: Filtrar el cliente por nombre exacto/coincidencia parcial si viene del módulo de búsqueda
    if (filtroNombre) {
      return lista.filter(c => c.nombre && c.nombre.toLowerCase().includes(filtroNombre));
    }

    // Prioridad 2: Filtrar los registros que carecen de datos de contacto
    if (this.ocultarIncompletos()) {
      return lista.filter(c => !c.telefono || !c.email);
    }

    return lista;
  });

  toggleFiltroIncompletos(): void {
    this.ocultarIncompletos.set(!this.ocultarIncompletos());
  }

  limpiarFiltroBuscador(): void {
    this.filtroNombreBuscador.set("");
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
