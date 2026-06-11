import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { CrearTarea } from "./crear-tarea";
import { ActualizarTarea } from "./actualizar-tarea";

@Injectable({
    providedIn: "root"
})
export class EditorTareaApi {

    private readonly httpClient: HttpClient = inject(HttpClient);

    crearTarea(proyectoId: number | null, tarea: CrearTarea): Observable<{ id: number }> {
        return this.httpClient.post<{ id: number }>("/v1/proyectos/" + proyectoId + "/tareas", tarea);
    }

    actualizarTarea(proyectoId: number | null, id: number, tarea: ActualizarTarea): Observable<void> {
        return this.httpClient.put<void>("/v1/proyectos/" + proyectoId + "/tareas/" + id, tarea);
    }
}