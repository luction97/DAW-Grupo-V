import { Component, computed, effect, inject, OnInit, Signal, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { TareaItem } from "./tarea-item";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { LucideClipboardList } from '@lucide/angular';
import { TooltipModule } from 'primeng/tooltip';
import { EditorTarea } from "../gestion/editor-tarea";
import { ActivatedRoute, Router } from "@angular/router";
import { ProyectoDetalleApi } from "./detalle-proyecto-api";
import { DetalleProyecto } from "./detalle-proyecto";

@Component({
  selector: "app-lista-tareas",
  templateUrl: "./lista-tareas.html",
  styleUrls: ["./lista-tareas.css"],
  imports: [ButtonModule, TagModule, LucideClipboardList, TooltipModule, EditorTarea]
})
export class ListaTareas implements OnInit {

  private readonly messageService: MessageService = inject(MessageService);

  private readonly ProyectoDetalleApi: ProyectoDetalleApi = inject(ProyectoDetalleApi);

  proyecto: WritableSignal<DetalleProyecto | null> = signal(null);

  tareas: Signal<TareaItem[]> = computed(() => {
    return this.proyecto()?.tareas || [];
  });

  dialogoVisible: WritableSignal<boolean> = signal(false);

  tareaActual: WritableSignal<TareaItem | null> = signal<TareaItem | null>(null);

  private readonly router: Router = inject(Router);

  readonly proyectoId: WritableSignal<number | null> = signal<number | null>(null);

  private readonly route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      if (!this.dialogoVisible()) {
        this.cargarProyecto();
      }
    });
    this.proyectoId.set(Number(this.route.snapshot.paramMap.get('id')));

    if (this.proyectoId() === null) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Id de proyecto no válido' });
      this.router.navigateByUrl("/proyectos");
    }

  }

  volver(): void {
    this.router.navigateByUrl("/proyectos");
  }

  ngOnInit(): void {
    this.cargarProyecto();
  }

  cargarProyecto(): void {
    this.ProyectoDetalleApi.buscarProyecto(this.proyectoId()).subscribe({
      next: (data) => {
        this.proyecto.set(data);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener el proyecto' });
      }
    });
  }

  nuevaTarea(): void {
    this.dialogoVisible.set(true);
  }

  modificarTarea(tarea: TareaItem): void {
    this.dialogoVisible.set(true);
    this.tareaActual.set(tarea);
  }

  mostrarDialogo(): void {
    this.dialogoVisible.set(true);
  }

  calcularEstadoTemporal(fechaStr: string): { texto: string; severity: 'success' | 'warn' | 'danger'; dias: number } | null {
    if (!fechaStr) return null;
    const [y, m, d] = fechaStr.split('-').map(Number);
    const fechaObj = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffMs = fechaObj.getTime() - hoy.getTime();
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (dias < 0) return { texto: 'Retrasado', severity: 'danger', dias };
    if (dias <= 7) return { texto: 'Próximo a vencer', severity: 'warn', dias };
    return { texto: 'En tiempo', severity: 'success', dias };
  }

}