import { Component, effect, inject, OnInit, signal, WritableSignal } from "@angular/core";
import { MessageService } from "primeng/api";
import { ProyectoItem } from "./proyecto-item";
import { ProyectosApi } from "./proyectos-api";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { LucideFolderKanban } from '@lucide/angular';
import { TooltipModule } from 'primeng/tooltip';
import { EditorProyecto } from "../gestion/editor-proyecto";
import { Router } from "@angular/router";

@Component({
  selector: "app-lista-proyectos",
  templateUrl: "./lista-proyectos.html",
  styleUrls: ["./lista-proyectos.css"],
  imports: [ButtonModule, TagModule, LucideFolderKanban, TooltipModule, EditorProyecto]
})
export class ListaProyectos implements OnInit {

  private readonly messageService: MessageService = inject(MessageService);

  private readonly ProyectosApi: ProyectosApi = inject(ProyectosApi);
  private readonly router: Router = inject(Router);

  proyectos: WritableSignal<ProyectoItem[]> = signal([]);

  dialogoVisible: WritableSignal<boolean> = signal(false);

  proyectoActual: WritableSignal<ProyectoItem | null> = signal<ProyectoItem | null>(null);

  constructor() {
    effect(() => {
      if (!this.dialogoVisible()) {
        this.cargarProyectos();
      }
    });
  }

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.ProyectosApi.buscarProyectos().subscribe({
      next: (data) => {
        this.proyectos.set(data);
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener los proyectos' });
      }
    });
  }

  nuevoProyecto(): void {
    this.dialogoVisible.set(true);
  }

  modificarProyecto(proyecto: ProyectoItem): void {
    this.dialogoVisible.set(true);
    this.proyectoActual.set(proyecto);
  }

  verTareas(proyecto: ProyectoItem): void {
    this.router.navigate(["/proyectos", proyecto.id, "tareas"]);
  }

  calcularEstadoTemporal(proyecto: ProyectoItem): { texto: string; severity: 'success' | 'warn' | 'danger'; dias: number } | null {
    if (!proyecto.fechaObjetivo) return null;
    const [y, m, d] = proyecto.fechaObjetivo.split('-').map(Number);
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