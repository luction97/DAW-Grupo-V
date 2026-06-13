import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { MessageService } from "primeng/api";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ToastModule } from "primeng/toast";
import { TableModule } from "primeng/table";

import { TareaItem } from "../tarea-item"; 
import { EstadoTarea } from "../../estado-tarea";
import { ProyectosApi } from "../../../listado/proyectos-api"; 
import { ProyectoItem } from "../../../listado/proyecto-item"; 
import { ProyectoDetalleApi } from "../../listado/detalle-proyecto-api";
import { EditorTareaApi } from "../../gestion/editor-tarea-api";
import { ActualizarTarea } from "../../gestion/actualizar-tarea";

interface BarraSvg {
  etiqueta: string;
  valor: number;
  x: number;
  y: number;
  height: number;
}

@Component({
  selector: "app-panel-tareas-estadisticas",
  standalone: true,
  templateUrl: "./tareas_estadisticas.html",
  styleUrls: ["./tareas_estadisticas.css"],
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, ToastModule, TableModule],
  providers: [MessageService]
})
export class PanelTareasEstadisticas implements OnInit {
  private readonly router = inject(Router);
  private readonly proyectosApi = inject(ProyectosApi);
  private readonly proyectoDetalleApi = inject(ProyectoDetalleApi);
  private readonly editorTareaApi = inject(EditorTareaApi);
  private readonly messageService = inject(MessageService);

  proyectos: WritableSignal<any[]> = signal([]);
  todasLasTareas: WritableSignal<any[]> = signal([]);
  estadoSeleccionado: WritableSignal<string | null> = signal(null);

  // Exponer el enum a la plantilla HTML para evaluar los estados en los botones
  readonly EstadoTareaEnum = EstadoTarea;

  proyectosActivosCount: Signal<number> = computed(() => 
    this.proyectos().filter(p => p.estado === 'ACTIVO').length
  );

  proyectosFinalizadosCount: Signal<number> = computed(() => 
    this.proyectos().filter(p => p.estado === 'FINALIZADO').length
  );

  proyectosBajasCount: Signal<number> = computed(() => 
    this.proyectos().filter(p => p.estado === 'BAJA').length
  );

  totalTareasPendientes: Signal<number> = computed(() => 
    this.tareasPendientes().length + this.tareasEnProgreso().length
  );

  proyectosDesglosados = computed(() => {
    const estado = this.estadoSeleccionado();
    if (!estado) return [];

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    return this.proyectos()
      .filter(p => p.estado === estado)
      .map(p => {
        const fCreacion = p.fecha_creacion || p.fechaCreacion ? new Date(p.fecha_creacion || p.fechaCreacion) : null;
        const fObjetivo = p.fechaObjetivo ? new Date(p.fechaObjetivo) : null;
        let metricaTiempo = 'N/D';

        if (estado === 'ACTIVO' && fCreacion) {
          const diff = hoy.getTime() - fCreacion.getTime();
          const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
          metricaTiempo = `En desarrollo: ${dias} días`;

          if (fObjetivo && hoy.getTime() > fObjetivo.getTime()) {
            const diffRetraso = hoy.getTime() - fObjetivo.getTime();
            const diasRetraso = Math.floor(diffRetraso / (1000 * 60 * 60 * 24));
            metricaTiempo += ` (Retrasado por ${diasRetraso} días)`;
          }
        } else if (estado === 'FINALIZADO' && fCreacion) {
          const fFin = fObjetivo || hoy; 
          const diff = fFin.getTime() - fCreacion.getTime();
          const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
          metricaTiempo = `Desarrollo total: ${dias} días`;
        } else if (estado === 'BAJA') {
          metricaTiempo = 'Proyecto descartado';
        }

        return { ...p, tiempoInfo: metricaTiempo };
      });
  });

  alertasTemporales = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const listaProyectos = this.proyectos();
    
    const proyectosVencidos = listaProyectos.filter(p => {
      if (!p.fechaObjetivo || p.estado === 'FINALIZADO') return false;
      const fechaObj = new Date(p.fechaObjetivo);
      return fechaObj.getTime() < hoy.getTime();
    });

    const proyectosProximos = listaProyectos.filter(p => {
      if (!p.fechaObjetivo || p.estado === 'FINALIZADO') return false;
      const fechaObj = new Date(p.fechaObjetivo);
      const diffMs = fechaObj.getTime() - hoy.getTime();
      const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return dias >= 0 && dias <= 7;
    });

    return { vencidos: proyectosVencidos, proximos: proyectosProximos };
  });

  graficoMensual = computed<BarraSvg[]>(() => {
    const mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const conteo = [0, 0, 0, 0, 0, 0];

    this.proyectos().forEach(p => {
      const valorFecha = p.fecha_creacion || p.fechaCreacion;
      if (!valorFecha) return;
      const fechaStr = typeof valorFecha === 'object' ? valorFecha.toISOString() : String(valorFecha);
      const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const mesIdx = parseInt(match[2], 10) - 1;
        if (mesIdx >= 0 && mesIdx < 6) conteo[mesIdx]++;
      }
    });

    const maxValor = Math.max(...conteo, 1);
    return conteo.map((valor, index) => {
      const height = (valor / maxValor) * 90;
      return { etiqueta: mesesLabels[index], valor, x: index * 60 + 40, y: 110 - height, height };
    });
  });

  graficoTareasSemanas = computed<BarraSvg[]>(() => {
    const intervalosLabels = ['Días 1-7', 'Días 8-14', 'Días 15-21', 'Días 22+'];
    const conteo = [0, 0, 0, 0];

    this.todasLasTareas().forEach(t => {
      if (t.estado !== EstadoTarea.FINALIZADA) return;
      const valorFecha = t.fecha_finalizacion || t.fechaFinalizacion;
      if (!valorFecha) return;
      const fechaStr = typeof valorFecha === 'object' ? valorFecha.toISOString() : String(valorFecha);
      const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const dia = parseInt(match[3], 10);
        if (dia <= 7) conteo[0]++;
        else if (dia <= 14) conteo[1]++;
        else if (dia <= 21) conteo[2]++;
        else conteo[3]++;
      }
    });

    const maxValor = Math.max(...conteo, 1);
    return conteo.map((valor, index) => {
      const height = (valor / maxValor) * 90;
      return { etiqueta: intervalosLabels[index], valor, x: index * 85 + 30, y: 110 - height, height };
    });
  });

  // Identifica tareas estrictamente PENDIENTES (sin fechaInicio / fecha_inicio)
  tareasPendientes: Signal<any[]> = computed(() => 
    this.todasLasTareas().filter(t => t.estado === EstadoTarea.PENDIENTE && !(t.fecha_inicio || t.fechaInicio))
  );

  // Identifica tareas EN PROGRESO (estado PENDIENTE pero con fechaInicio / fecha_inicio registrada)
  tareasEnProgreso: Signal<any[]> = computed(() => 
    this.todasLasTareas().filter(t => t.estado === EstadoTarea.PENDIENTE && (t.fecha_inicio || t.fechaInicio))
  );

  tareasFinalizadas: Signal<any[]> = computed(() => 
    this.todasLasTareas().filter(t => t.estado === EstadoTarea.FINALIZADA)
  );

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    this.proyectosApi.buscarProyectos().subscribe({
      next: (listaProyectos: ProyectoItem[]) => {
        if (listaProyectos.length === 0) return;
        const peticionesDetalle = listaProyectos.map(p => this.proyectoDetalleApi.buscarProyecto(p.id).pipe(catchError(() => of(null))));
        forkJoin(peticionesDetalle).subscribe({
          next: (detalles) => {
            const listaUnificada: any[] = [];
            detalles.forEach((projDetalle, index) => {
              if (projDetalle && projDetalle.tareas) {
                projDetalle.tareas.forEach((t: TareaItem) => {
                  listaUnificada.push({
                    ...t,
                    proyectoId: listaProyectos[index].id, // Mantenemos la referencia del ID del proyecto
                    proyectoNombre: listaProyectos[index].nombre || 'Sin Nombre',
                    clienteNombre: listaProyectos[index].cliente?.nombre || 'Proyecto Interno'
                  });
                });
              }
            });
            this.proyectos.set(listaProyectos);
            this.todasLasTareas.set(listaUnificada);
          }
        });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las métricas globales' })
    });
  }

  // Ejecuta la actualización de estado interactiva del Kanban hacia la API
  cambiarEstadoTarea(tarea: any, nuevoEstado: EstadoTarea): void {
    const dto: ActualizarTarea = {
      descripcion: tarea.descripcion,
      estado: nuevoEstado
    };

    // Obtenemos la fecha actual simulada por el sistema
    const isoFechaActual = new Date().toISOString();

    this.editorTareaApi.actualizarTarea(tarea.proyectoId, tarea.id, dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado de tarea actualizado.' });
        
        // Mutación controlada local para actualizar el Kanban reactivamente sin re-consultar HTTP completo
        const tareasModificadas = this.todasLasTareas().map(t => {
          if (t.id === tarea.id) {
            let fechaInicioActualizada = t.fecha_inicio || t.fechaInicio;
            let fechaFinActualizada = t.fecha_finalizacion || t.fechaFinalizacion;

            if (nuevoEstado === EstadoTarea.PENDIENTE) {
              // Si se mueve a "En Progreso" (que operativamente es PENDIENTE con fecha_inicio)
              fechaInicioActualizada = isoFechaActual;
              fechaFinActualizada = null;
            } else if (nuevoEstado === EstadoTarea.FINALIZADA) {
              fechaFinActualizada = isoFechaActual;
            }

            return { 
              ...t, 
              estado: nuevoEstado,
              fecha_inicio: fechaInicioActualizada,
              fechaInicio: fechaInicioActualizada,
              fecha_finalizacion: fechaFinActualizada,
              fechaFinalizacion: fechaFinActualizada
            };
          }
          return t;
        });

        this.todasLasTareas.set(tareasModificadas);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado de la tarea.' });
      }
    });
  }

  // Método auxiliar para mover de "En Progreso" de regreso a "Pendiente" (limpiando fechas de inicio)
  moverAPendienteEstricto(tarea: any): void {
    const dto: ActualizarTarea = {
      descripcion: tarea.descripcion,
      estado: EstadoTarea.PENDIENTE
    };

    this.editorTareaApi.actualizarTarea(tarea.proyectoId, tarea.id, dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tarea devuelta a Pendiente.' });
        
        const tareasModificadas = this.todasLasTareas().map(t => {
          if (t.id === tarea.id) {
            return { 
              ...t, 
              estado: EstadoTarea.PENDIENTE,
              fecha_inicio: null,
              fechaInicio: null,
              fecha_finalizacion: null,
              fechaFinalizacion: null
            };
          }
          return t;
        });
        this.todasLasTareas.set(tareasModificadas);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo revertir el estado.' })
    });
  }

  seleccionarEstado(estado: string): void {
    if (this.estadoSeleccionado() === estado) {
      this.estadoSeleccionado.set(null);
    } else {
      this.estadoSeleccionado.set(estado);
    }
  }

  irAlProyectoTareas(event: Event, proyectoId: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/proyectos', proyectoId, 'tareas']);
  }

  volver(): void {
    this.router.navigateByUrl("/proyectos");
  }
}
