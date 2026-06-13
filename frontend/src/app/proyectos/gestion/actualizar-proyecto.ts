import { EstadoProyecto } from "../estado-proyecto";
import { CrearProyecto } from "./crear-proyecto";

export interface ActualizarProyecto extends Pick<CrearProyecto, "nombre" | "idCliente" | "fechaObjetivo"> {

    estado: EstadoProyecto;

}