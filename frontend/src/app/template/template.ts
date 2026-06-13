import { Component, inject, signal } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { AuthStore } from "../auth/auth-store";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs";

@Component({
    selector: 'app-template',
    templateUrl: './template.html',
    styleUrl: './template.css',
    imports: [ButtonModule, TooltipModule]
})
export class Template {
    private readonly authStore: AuthStore = inject(AuthStore);
    private readonly router: Router = inject(Router);

    readonly mostrarTopbar = signal(true);

    constructor() {
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe((event) => {
            this.mostrarTopbar.set(event.url !== '/login');
        });
    }

    cerrarSesion() {
        this.authStore.cerrarSesion();
    }
}
