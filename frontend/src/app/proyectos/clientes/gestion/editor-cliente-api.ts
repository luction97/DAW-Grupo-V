import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { ActualizarCliente } from "./actualizar-cliente";
import { CrearCliente } from "./crear-cliente";

@Injectable({
    providedIn: "root"
})
export class EditorClienteApi {

    private readonly httpClient: HttpClient = inject(HttpClient);

    crearCliente(cliente: CrearCliente): Observable<{ id: number }> {
        return this.httpClient.post<{ id: number }>("/v1/clientes", cliente);
    }

    actualizarCliente(id: number, cliente: ActualizarCliente): Observable<void> {
        return this.httpClient.put<void>("/v1/clientes/" + id, cliente);
    }
}