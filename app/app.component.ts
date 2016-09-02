import { Component } from '@angular/core';
import { pages } from './app.routing';
import { PacemHamburgerMenu } from './../pacem/pacem-ui';

@Component({
    selector: 'pacem-scripts',
    template: `<h1>Pacem - Angular 2 Utility Library</h1>
<pacem-hamburger-menu>
    <a *ngFor="let cmp of components" [routerLink]="['/pacem', cmp.name]" [routerLinkActive]="'active'">{{ cmp.caption }}</a>
</pacem-hamburger-menu>
<router-outlet></router-outlet>
`, entryComponents: [PacemHamburgerMenu]
})
export class AppComponent {
    private components = pages.map(p => { return { name: p.component.name, caption: p.label }; });
}