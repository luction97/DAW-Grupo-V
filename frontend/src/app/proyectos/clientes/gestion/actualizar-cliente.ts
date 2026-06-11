import { EstadoCliente } from "../estado-cliente";
import { CrearCliente } from "./crear-cliente";

export interface ActualizarCliente extends Pick<CrearCliente, "nombre"> {

    estado: EstadoCliente;

}