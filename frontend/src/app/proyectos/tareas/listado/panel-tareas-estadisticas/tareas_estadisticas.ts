import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { MessageService } from "primeng/api";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";

import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { ToastModule } from "primeng/toast";

import { TareaItem } from "../tarea-item"; 
import { EstadoTarea } from "../../estado-tarea";
import { ProyectosApi } from "../../../listado/proyectos-api"; 
import { ProyectoItem } from "../../../listado/proyecto-item"; 
import { ProyectoDetalleApi } from "../../listado/detalle-proyecto-api";

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
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService]
})
export class PanelTareasEstadisticas implements OnInit {
  private readonly router = inject(Router);
  private readonly proyectosApi = inject(ProyectosApi);
  private readonly proyectoDetalleApi = inject(ProyectoDetalleApi);
  private readonly messageService = inject(MessageService);

  proyectos: WritableSignal<any[]> = signal([]);
  todasLasTareas: WritableSignal<any[]> = signal([]);

  proyectosActivosCount: Signal<number> = computed(() => this.proyectos().length);
  totalTareasPendientes: Signal<number> = computed(() => this.tareasPendientes().length);

  proyectosPorCliente: Signal<{ cliente: string; cantidad: number }[]> = computed(() => {
    const mapa = new Map<string, number>();
    this.proyectos().forEach(p => {
      const clienteNombre = p.cliente?.nombre || 'Proyecto Interno'; 
      mapa.set(clienteNombre, (mapa.get(clienteNombre) || 0) + 1);
    });
    return Array.from(mapa.entries()).map(([cliente, cantidad]) => ({ cliente, cantidad }));
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

    return {
      vencidos: proyectosVencidos,
      proximos: proyectosProximos
    };
  });

  // --- GRÁFICO 1: VOLUMEN MENSUAL RE-INGENIERADO (EXTRACCIÓN DIRECTA DE TEXTO) ---
  graficoMensual = computed<BarraSvg[]>(() => {
    const mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const conteo = [0, 0, 0, 0, 0, 0];

    this.proyectos().forEach(p => {
      const valorFecha = p.fecha_creacion || p.fechaCreacion;
      if (!valorFecha) return;

      // Convertimos a string ISO puro para evitar problemas si viene objeto Date
      const fechaStr = typeof valorFecha === 'object' ? valorFecha.toISOString() : String(valorFecha);
      
      // Buscamos el patrón YYYY-MM-DD usando expresión regular
      const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const mesIdx = parseInt(match[2], 10) - 1; // El grupo [2] es el mes
        if (mesIdx >= 0 && mesIdx < 6) {
          conteo[mesIdx]++;
        }
      }
    });

    const maxValor = Math.max(...conteo, 1);
    const altoMaximoSvg = 90;

    return conteo.map((valor, index) => {
      const height = (valor / maxValor) * altoMaximoSvg;
      return {
        etiqueta: mesesLabels[index],
        valor: valor,
        x: index * 60 + 40,
        y: 110 - height,
        height: height
      };
    });
  });

  // --- GRÁFICO 2: PRODUCTIVIDAD SEMANAL RE-INGENIERADO (EXTRACCIÓN DIRECTA DE TEXTO) ---
  graficoTareasSemanas = computed<BarraSvg[]>(() => {
    const semanasLabels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const conteo = [0, 0, 0, 0];

    this.todasLasTareas().forEach(t => {
      if (t.estado !== EstadoTarea.FINALIZADA) return;

      const valorFecha = t.fecha_finalizacion || t.fechaFinalizacion;
      if (!valorFecha) return;
      
      const fechaStr = typeof valorFecha === 'object' ? valorFecha.toISOString() : String(valorFecha);
      
      const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        const dia = parseInt(match[3], 10); // El grupo [3] es el día del mes
        if (dia <= 7) conteo[0]++;
        else if (dia <= 14) conteo[1]++;
        else if (dia <= 21) conteo[2]++;
        else conteo[3]++;
      }
    });

    const maxValor = Math.max(...conteo, 1);
    const altoMaximoSvg = 90;

    return conteo.map((valor, index) => {
      const height = (valor / maxValor) * altoMaximoSvg;
      return {
        etiqueta: semanasLabels[index],
        valor: valor,
        x: index * 80 + 55,
        y: 110 - height,
        height: height
      };
    });
  });

  tareasPendientes: Signal<any[]> = computed(() => 
    this.todasLasTareas().filter(t => {
      const tieneInicio = t.fecha_inicio || t.fechaInicio;
      return t.estado === EstadoTarea.PENDIENTE && !tieneInicio;
    })
  );

  tareasEnProgreso: Signal<any[]> = computed(() => 
    this.todasLasTareas().filter(t => {
      const tieneInicio = t.fecha_inicio || t.fechaInicio;
      return t.estado === EstadoTarea.PENDIENTE && tieneInicio;
    })
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

        const peticionesDetalle = listaProyectos.map(p => 
          this.proyectoDetalleApi.buscarProyecto(p.id).pipe(
            catchError(() => of(null))
          )
        );

        forkJoin(peticionesDetalle).subscribe({
          next: (detalles) => {
            const listaUnificada: any[] = [];
            detalles.forEach((projDetalle, index) => {
              if (projDetalle && projDetalle.tareas) {
                projDetalle.tareas.forEach((t: TareaItem) => {
                  listaUnificada.push({
                    ...t,
                    proyectoNombre: listaProyectos[index].nombre || 'Sin Nombre'
                  });
                });
              }
            });
            
            // CONFIGURAMOS LAS DOS SEÑALES JUNTAS AL FINAL
            // Esto obliga a Angular a redibujar todo el árbol con la data unificada al mismo tiempo
            this.proyectos.set(listaProyectos);
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
