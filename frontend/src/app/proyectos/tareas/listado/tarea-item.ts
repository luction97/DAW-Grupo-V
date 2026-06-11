import { EstadoTarea } from "../estado-tarea";

export interface TareaItem{
    id: number;
    descripcion: string;
    estado: EstadoTarea;
}