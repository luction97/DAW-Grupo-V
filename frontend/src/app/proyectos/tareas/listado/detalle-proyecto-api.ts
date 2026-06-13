import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { DetalleProyecto } from "./detalle-proyecto";

@Injectable({
    providedIn: 'root'
})
export class ProyectoDetalleApi {

    private readonly httpClient = inject(HttpClient);

    buscarProyecto(id: number | null): Observable<DetalleProyecto> {
        return this.httpClient.get<DetalleProyecto>(`/v1/proyectos/${id}`);
    }

}