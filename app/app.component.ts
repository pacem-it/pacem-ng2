import { Component } from '@angular/core';
import { pages } from './app.routing';

@Component({
    selector: 'pacem-scripts',
    template: `<h1>Angular2 - Pacem Scripts</h1>
<nav>
    <a *ngFor="let cmp of components" [routerLink]="['/pacem', cmp.name]" [routerLinkActive]="'active'">{{ cmp.caption }}</a>
</nav>
<router-outlet></router-outlet>
`
})
export class AppComponent {
    private components = pages.map(p => { return { name: p.component.name, caption: p.label }; });
}