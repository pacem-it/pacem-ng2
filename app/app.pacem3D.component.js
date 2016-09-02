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
var pacem_core_1 = require('./../pacem/pacem-core');
var pacem_3d_1 = require('./../pacem/pacem-3d');
var Pacem3DComponent = (function () {
    function Pacem3DComponent() {
        this.objects = [
            {
                'position': '-4.05 2 2.6',
                'tag': 'cube#1',
                'mesh': new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), new THREE.MeshNormalMaterial())
            },
            {
                'position': '0 0 0',
                'tag': '1st_floor',
                'format': 'JSON',
                'url': "barchessa.json" }
        ];
        this.initialized = false;
    }
    Pacem3DComponent.prototype.ngAfterViewInit = function () {
        this.initialized = true;
        this.onResize();
    };
    Pacem3DComponent.prototype.onResize = function (evt) {
        if (!this.initialized)
            return;
        var offset = pacem_core_1.PacemUtils.offset(this.container.nativeElement), win = window;
        var viewportHeight = win.innerHeight || win.document.documentElement.clientHeight || win.document.body.clientHeight || 0;
        this.pacem3D.resize('100%', viewportHeight - offset.top);
    };
    Pacem3DComponent.prototype.onOver = function (obj) {
        console.log('over: ' + JSON.stringify({ id: obj.id, tag: obj.tag, mesh: obj.object instanceof THREE.Mesh }));
    };
    Pacem3DComponent.prototype.onClick = function (obj) {
        console.log('click: ' + JSON.stringify({ id: obj.id, tag: obj.tag, mesh: obj.object instanceof THREE.Mesh }));
    };
    Pacem3DComponent.prototype.onOut = function (obj) {
        console.log('out: ' + JSON.stringify({ id: obj.id, tag: obj.tag, mesh: obj.object instanceof THREE.Mesh }));
    };
    __decorate([
        core_1.ViewChild("canvas"), 
        __metadata('design:type', pacem_3d_1.Pacem3D)
    ], Pacem3DComponent.prototype, "pacem3D", void 0);
    __decorate([
        core_1.ViewChild("container"), 
        __metadata('design:type', core_1.ElementRef)
    ], Pacem3DComponent.prototype, "container", void 0);
    Pacem3DComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-3d',
            template: "<h2>Pacem 3D</h2>\n<div #container (window:resize)=\"onResize($event)\"><pacem-3d orbit=\"true\" interactive=\"true\" #canvas\n        (itemclick)=\"onClick($event)\"\n        (itemover)=\"onOver($event)\"\n        (itemout)=\"onOut($event)\">\n    <pacem-3d-object *ngFor=\"let obj of objects; let i=index\" [url]=\"obj.url\" [object]=\"obj.mesh\" [position]=\"obj.position\" [tag]=\"obj.tag\" [format]=\"obj.format\"></pacem-3d-object>\n    <pacem-3d-light position=\"25 12.5 50\" intensity=\"1\" color=\"#8fbbcc\"></pacem-3d-light>\n</pacem-3d></div>" /*,
                entryComponents: [Pacem3D]*/
        }), 
        __metadata('design:paramtypes', [])
    ], Pacem3DComponent);
    return Pacem3DComponent;
}());
exports.Pacem3DComponent = Pacem3DComponent;
