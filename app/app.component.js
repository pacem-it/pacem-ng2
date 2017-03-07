"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var app_routing_1 = require("./app.routing");
var pacem_ui_1 = require("./../pacem/pacem-ui");
var AppComponent = (function () {
    function AppComponent() {
        this.components = app_routing_1.pages.map(function (p) { return { name: p.component.name, caption: p.label }; });
    }
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'pacem-scripts',
        template: "<h1 class=\"pacem-animatable\">Pacem - Angular 2 Utility Library</h1>\n<pacem-hamburger-menu>\n    <a *ngFor=\"let cmp of components\" [routerLink]=\"['/pacem', cmp.name]\" [routerLinkActive]=\"'active'\">{{ cmp.caption }}</a>\n</pacem-hamburger-menu>\n<router-outlet></router-outlet>\n", entryComponents: [pacem_ui_1.PacemHamburgerMenu]
    }),
    __metadata("design:paramtypes", [])
], AppComponent);
exports.AppComponent = AppComponent;
