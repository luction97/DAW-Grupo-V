import { EstadoProyecto } from "../../../proyectos/estado-proyecto";
import { TareaItem } from "./tarea-item";

export interface DetalleProyecto{
    nombre: string;
    cliente: string;
    fechaObjetivo: string;
    estado: EstadoProyecto;
    tareas: TareaItem[];
}