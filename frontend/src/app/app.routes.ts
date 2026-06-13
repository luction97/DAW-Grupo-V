import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { ListaTareas } from './proyectos/tareas/listado/lista-tareas';
import { ListaProyectos } from './proyectos/listado/lista-proyectos';

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
        path: 'proyectos',
        component: ListaProyectos
    },
    {
        path: "**",
        redirectTo: "login"
    }
];
