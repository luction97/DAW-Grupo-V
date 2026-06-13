import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { ListaTareas } from './proyectos/tareas/listado/lista-tareas';
import { ListaProyectos } from './proyectos/listado/lista-proyectos';
import { PanelTareasEstadisticas } from './proyectos/tareas/listado/panel-tareas-estadisticas/tareas_estadisticas';
import { AgendaClientes } from './proyectos/clientes/listado/agenda-clientes/agenda-clientes';
import { BusquedaAvanzada } from './proyectos/listado/busqueda-avanzada/busqueda-avanzada';

export const routes: Routes = [
    {
        path: "login",
        component: Login
    },
    {
        path: 'proyectos/:id/tareas',
        component: ListaTareas
    },
    {
        path: 'proyectos/dashboard-global',
        component: PanelTareasEstadisticas
    },
    {   path: 'proyectos/agenda',
        component: AgendaClientes
    },
    {   path: 'proyectos/busqueda',
        component: BusquedaAvanzada
    },
    {
        path: 'proyectos',
        component: ListaProyectos
    },
    {
        path: "**",
        redirectTo: "login"
    }
];
