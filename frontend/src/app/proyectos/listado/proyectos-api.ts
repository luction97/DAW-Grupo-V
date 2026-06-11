import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProyectoItem} from "./proyecto-item";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ProyectosApi {

    private readonly httpClient = inject(HttpClient);
    
    buscarProyectos(): Observable<ProyectoItem[]> {
        return this.httpClient.get<ProyectoItem[]>('/v1/proyectos');
    }

}