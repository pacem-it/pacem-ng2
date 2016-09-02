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
var core_1 = require('@angular/core');
//
var pacem_3d_1 = require('./pacem-3d');
var pacem_core_1 = require('./pacem-core');
var pacem_ui_1 = require('./pacem-ui');
var pacem_maps_leaflet_1 = require('./pacem-maps-leaflet');
var pacem_net_1 = require('./pacem-net');
var pacem_scaffolding_1 = require('./pacem-scaffolding');
var PacemModule = (function () {
    function PacemModule() {
    }
    PacemModule = __decorate([
        core_1.NgModule({
            exports: [pacem_core_1.PacemCoreModule, pacem_net_1.PacemNetModule, pacem_3d_1.Pacem3DModule, pacem_ui_1.PacemUIModule, pacem_maps_leaflet_1.PacemMapsLeafletModule, pacem_scaffolding_1.PacemScaffoldingModule]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemModule);
    return PacemModule;
}());
exports.PacemModule = PacemModule;
