import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { CrearProyecto } from "./crear-proyecto";
import { ActualizarProyecto } from "./actualizar-proyecto";

@Injectable({
    providedIn: "root"
})
export class EditorProyectoApi {

    private readonly httpClient: HttpClient = inject(HttpClient);

    crearProyecto(proyecto: CrearProyecto): Observable<{id: number}> {
        return this.httpClient.post<{id: number}>("/v1/proyectos", proyecto);
    }

    actualizarProyecto(id: number, proyecto: ActualizarProyecto): Observable<void> {
        return this.httpClient.put<void>("/v1/proyectos/" +  id, proyecto);
    }
}