import { Component, inject, OnInit, signal, computed, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ProyectosApi } from "../proyectos-api";
import { ProyectoItem } from "../proyecto-item";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-busqueda-avanzada",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    CardModule,
    TagModule
  ],
  templateUrl: "./busqueda-avanzada.html"
})
export class BusquedaAvanzada implements OnInit {
  private readonly proyectosApi: ProyectosApi = inject(ProyectosApi);
  private readonly router: Router = inject(Router);

  proyectos: WritableSignal<ProyectoItem[]> = signal([]);
  filtroNombre: WritableSignal<string> = signal("");
  filtroEstado: WritableSignal<string | null> = signal(null);

  opcionesEstado = [
    { label: 'Todos los estados', value: null },
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Finalizado', value: 'FINALIZADO' },
    { label: 'Baja', value: 'BAJA' }
  ];

  ngOnInit(): void {
    this.proyectosApi.buscarProyectos().subscribe({
      next: (data: ProyectoItem[]) => this.proyectos.set(data),
      error: () => console.error("Error al recuperar proyectos para la búsqueda")
    });
  }

  proyectosFiltrados = computed(() => {
    let resultado = this.proyectos();

    const termino = this.filtroNombre().toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(p => {
        const coincideProyecto = p.nombre ? p.nombre.toLowerCase().includes(termino) : false;
        const coincideCliente = p.cliente?.nombre ? p.cliente.nombre.toLowerCase().includes(termino) : false;
        return coincideProyecto || coincideCliente;
      });
    }

    const estado = this.filtroEstado();
    if (estado) {
      resultado = resultado.filter(p => p.estado === estado);
    }

    return resultado;
  });

  irAlProyecto(event: Event, proyectoId: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(["/proyectos", proyectoId, "tareas"]);
  }


  irAlCliente(event: Event, clienteNombre: string): void {
    // 1. Evita que el enlace intente recargar la página o navegar a una URL vacía
    event.preventDefault();
    event.stopPropagation();

    // 2. Guardamos el nombre en el sessionStorage para la agenda
    sessionStorage.setItem('filtro_cliente_agenda', clienteNombre);

    // 3. Forzamos la navegación a la ruta de la agenda
    this.router.navigate(["/proyectos/agenda"]).catch(err => {
      console.error("Error al navegar a la agenda de clientes:", err);
    });
  }



  volverAProyectos(): void {
    this.router.navigate(['/proyectos']);
  }
}
