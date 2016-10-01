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
var pacem_maps_leaflet_1 = require('./../pacem/pacem-maps-leaflet');
var pacem_ui_1 = require('./../pacem/pacem-ui');
var pacem_core_1 = require('./../pacem/pacem-core');
var PacemMapComponent = (function () {
    function PacemMapComponent() {
        this.hereSpot = '44.714188025077984,10.296516444873811';
        this.hereInfluence = 10000; // meters
        this.plungeSpot = [44, 10];
        this.markers = [
            { pos: [43, 9], desc: '<b>Primo</b> elemento' },
            { pos: [42, 8], desc: '<b>Secondo</b> elemento' },
            { pos: [41, 7], desc: '<b>Terzo</b> elemento' },
            { pos: [40, 9], desc: '<b>Quarto</b> elemento' },
        ];
        this.steps = [];
        this.refreshSteps();
        //
        /*var deferred = PacemPromise.defer();
        deferred.promise.success(v => alert(v));
        setTimeout(()=>deferred.resolve('hello pacemjs!'), 2500);*/
    }
    PacemMapComponent.prototype.ngAfterViewInit = function () {
        this.initialized = true;
        this.onResize();
    };
    PacemMapComponent.prototype.onResize = function (evt) {
        if (!this.initialized)
            return;
        var offset = pacem_core_1.PacemUtils.offset(this.container.nativeElement), win = window;
        var viewportHeight = win.innerHeight || win.document.documentElement.clientHeight || win.document.body.clientHeight || 0;
        this.container.nativeElement.style.width = '100%';
        this.container.nativeElement.style.height = (viewportHeight - offset.top) + 'px';
    };
    PacemMapComponent.prototype.onDrag = function (evt) {
        console.log(evt.position);
        this.plungeSpot = [evt.position.lat, evt.position.lng];
        this.refreshSteps();
    };
    PacemMapComponent.prototype.spliceMarker = function (ndx) {
        this.markers.splice(ndx, 1);
        this.refreshSteps();
    };
    PacemMapComponent.prototype.setupInfo = function (ndx) {
        this.markers[ndx].desc = 'This is the info #<b>' + (ndx + 1) + '</b>';
    };
    PacemMapComponent.prototype.refreshSteps = function () {
        this.steps = [this.plungeSpot].concat(this.markers.map(function (m) { return m.pos; }));
    };
    __decorate([
        core_1.ViewChild("container"), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemMapComponent.prototype, "container", void 0);
    PacemMapComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-map',
            template: "<h2 class=\"pacem-animatable\">Pacem Map</h2>\n<div #container (window:resize)=\"onResize($event)\"><pacem-map>\n    <pacem-map-polyline [stroke]=\"'yellow'\" [path]=\"steps\">I'm a polyline!</pacem-map-polyline>\n    <pacem-map-circle [center]=\"hereSpot\" [radius]=\"hereInfluence\">Influence of <b>{{ (hereInfluence * 0.001) }}</b>km radius</pacem-map-circle>\n    <pacem-map-marker [position]=\"hereSpot\">I'm <b>here</b>!</pacem-map-marker>\n    <pacem-map-marker [position]=\"plungeSpot\" (drag)=\"onDrag($event)\" [draggable]=\"true\">\n        Plunge here!\n        <br />(<pacem-map-link [target]=\"plungeSpot\">navigate</pacem-map-link>)\n    </pacem-map-marker>\n    <pacem-map-marker *ngFor=\"let marker of markers; let i=index\" [position]=\"marker.pos\" \n        (info)=\"setupInfo(i)\"\n        (close)=\"spliceMarker(i)\"><div [innerHTML]=\"marker.desc | pacemHighlight:(i+1).toString()\"></div></pacem-map-marker>\n</pacem-map></div>",
            entryComponents: [pacem_maps_leaflet_1.PacemMap, pacem_maps_leaflet_1.PacemMapMarker, pacem_maps_leaflet_1.PacemMapCircle, pacem_maps_leaflet_1.PacemMapLink, pacem_maps_leaflet_1.PacemMapPolyline],
            providers: [pacem_core_1.PacemPromise, pacem_ui_1.PacemHighlight],
            inputs: ['markers', 'steps']
        }), 
        __metadata('design:paramtypes', [])
    ], PacemMapComponent);
    return PacemMapComponent;
}());
exports.PacemMapComponent = PacemMapComponent;
