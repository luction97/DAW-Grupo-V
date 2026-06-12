import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

// --- COMPONENTES DE PRIMENG ---
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ToastModule } from "primeng/toast";

// --- INTERFACES Y SERVICIOS ---
import { TareaItem } from "../tarea-item"; 
import { EstadoTarea } from "../../estado-tarea";
import { ProyectosApi } from "../../../listado/proyectos-api"; 
import { ProyectoItem } from "../../../listado/proyecto-item"; 
import { ProyectoDetalleApi } from "../../listado/detalle-proyecto-api"; // Servicio para traer las tareas reales

interface TareaConProyecto extends TareaItem {
  proyectoNombre: string;
}

@Component({
  selector: "app-panel-tareas-estadisticas",
  standalone: true,
  templateUrl: "./tareas_estadisticas.html",
  styleUrls: ["./tareas_estadisticas.css"],
  imports: [CommonModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService]
})
export class PanelTareasEstadisticas implements OnInit {
  private readonly router = inject(Router);
  private readonly proyectosApi = inject(ProyectosApi);
  private readonly proyectoDetalleApi = inject(ProyectoDetalleApi);
  private readonly messageService = inject(MessageService);

  proyectos: WritableSignal<ProyectoItem[]> = signal([]);
  
  // Guardamos la lista unificada de tareas con tipado explícito
  todasLasTareas: WritableSignal<TareaConProyecto[]> = signal([]);

  // --- MÓDULO DE ESTADÍSTICAS GLOBALES (Verónica / Maxi) ---
  proyectosActivosCount: Signal<number> = computed(() => this.proyectos().length);

  totalTareasPendientes: Signal<number> = computed(() => 
    this.tareasPendientes().length
  );

  proyectosPorCliente: Signal<{ cliente: string; cantidad: number }[]> = computed(() => {
    const mapa = new Map<string, number>();
    this.proyectos().forEach(p => {
      // Extraemos el nombre del objeto cliente para evitar el error de asignación de tipos
      const clienteNombre = p.cliente?.nombre || 'Cliente General'; 
      mapa.set(clienteNombre, (mapa.get(clienteNombre) || 0) + 1);
    });
    return Array.from(mapa.entries()).map(([cliente, cantidad]) => ({ cliente, cantidad }));
  });

  // --- MÓDULO DE PANEL VISUAL KANBAN GENERAL (Maxi) ---
  tareasPendientes: Signal<TareaConProyecto[]> = computed(() => 
    this.todasLasTareas().filter(t => t.estado === EstadoTarea.PENDIENTE)
  );

  tareasEnProgreso: Signal<TareaConProyecto[]> = computed(() => 
    this.todasLasTareas().filter(t => 
      t.estado !== EstadoTarea.PENDIENTE && 
      t.estado !== EstadoTarea.FINALIZADA && 
      t.estado !== EstadoTarea.BAJA
    )
  );

  tareasFinalizadas: Signal<TareaConProyecto[]> = computed(() => 
    this.todasLasTareas().filter(t => t.estado === EstadoTarea.FINALIZADA)
  );

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    this.proyectosApi.buscarProyectos().subscribe({
      next: (listaProyectos: ProyectoItem[]) => {
        this.proyectos.set(listaProyectos);

        if (listaProyectos.length === 0) return;

        // Creamos un arreglo de peticiones observables para traer el detalle (con tareas) de cada proyecto
        const peticionesDetalle = listaProyectos.map(p => 
          this.proyectoDetalleApi.buscarProyecto(p.id).pipe(
            catchError(() => of(null)) // Evita que el flujo falle por completo si un proyecto falla
          )
        );

        forkJoin(peticionesDetalle).subscribe({
          next: (detalles) => {
            const listaUnificada: TareaConProyecto[] = [];
            
            detalles.forEach((projDetalle, index) => {
              // Si la petición fue exitosa y contiene el arreglo de tareas
              if (projDetalle && projDetalle.tareas) {
                projDetalle.tareas.forEach((t: TareaItem) => {
                  listaUnificada.push({
                    ...t,
                    proyectoNombre: listaProyectos[index].nombre || 'Sin Nombre'
                  });
                });
              }
            });
            
            this.todasLasTareas.set(listaUnificada);
          }
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las métricas globales' });
      }
    });
  }

  volver(): void {
    this.router.navigateByUrl("/proyectos");
  }
}
