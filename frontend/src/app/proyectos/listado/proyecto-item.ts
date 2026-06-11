import { ClienteItem } from "../clientes/listado/cliente-item";

export interface ProyectoItem{
    id: number;
    nombre: string;
    estado: string;
    cliente: ClienteItem;
}