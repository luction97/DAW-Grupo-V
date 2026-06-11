import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ClienteItem } from "./cliente-item";
import { EstadoCliente } from "../estado-cliente";

@Injectable({
    providedIn: 'root'
})
export class ClientesApi {

    private readonly httpClient = inject(HttpClient);

    buscarClientes(estado?: EstadoCliente): Observable<ClienteItem[]> {

        let path: string = '/v1/clientes';

        if (estado) {
            path += "?estado=" + estado;
        }

        return this.httpClient.get<ClienteItem[]>(path);
    }

}