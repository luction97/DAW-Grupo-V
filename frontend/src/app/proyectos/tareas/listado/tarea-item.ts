import { EstadoTarea } from "../estado-tarea";

export interface TareaItem {
  id: number;
  descripcion: string;
  estado: string; // O el enumerador correspondiente en el frontend
  idProyecto: number;
  fechaFinalizacion?: string; // Formato 'YYYY-MM-DD' proveniente del backend
}