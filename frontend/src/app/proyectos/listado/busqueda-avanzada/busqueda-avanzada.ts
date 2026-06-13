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
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TableModule, CardModule, TagModule],
  templateUrl: "./busqueda-avanzada.html"
})
export class BusquedaAvanzada implements OnInit {
  private readonly proyectosApi: ProyectosApi = inject(ProyectosApi);
  private readonly router: Router = inject(Router);

  // Señal con el universo completo de proyectos
  proyectos: WritableSignal<ProyectoItem[]> = signal([]);

  // Estados de los filtros (Filtro por Nombre y Filtro por Estado)
  filtroNombre: WritableSignal<string> = signal("");
  filtroEstado: WritableSignal<string | null> = signal(null);

  // Opciones para el desplegable de estados
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

  // Lógica de Filtrado Reactivo (Búsqueda Avanzada)
  proyectosFiltrados = computed(() => {
    let resultado = this.proyectos();

    // 1. Filtrado por nombre (insensible a mayúsculas/minúsculas)
    const termino = this.filtroNombre().toLowerCase().trim();
    if (termino) {
      resultado = resultado.filter(p => p.nombre.toLowerCase().includes(termino));
    }

    // 2. Filtrado por estado del proyecto
    const estado = this.filtroEstado();
    if (estado) {
      resultado = resultado.filter(p => p.estado === estado);
    }

    return resultado;
  });

  volverAProyectos(): void {
    this.router.navigate(['/proyectos']);
  }
}