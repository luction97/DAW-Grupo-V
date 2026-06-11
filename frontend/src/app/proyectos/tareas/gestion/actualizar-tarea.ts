import { EstadoTarea } from "../estado-tarea";
import { CrearTarea } from "./crear-tarea";

export interface ActualizarTarea extends Pick<CrearTarea, "descripcion"> {

    estado: EstadoTarea;

}