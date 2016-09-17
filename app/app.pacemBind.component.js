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
var pacem_ui_1 = require('./../pacem/pacem-ui');
var PacemBindComponent = (function () {
    function PacemBindComponent(bindings) {
        this.bindings = bindings;
        this.obj = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshNormalMaterial());
    }
    PacemBindComponent.prototype.refresh = function () {
        this.bindings.refresh();
    };
    PacemBindComponent.prototype.startDrag = function (evt) {
        evt.stopPropagation();
        this.startPoint = { x: evt.pageX, y: evt.pageY };
        this.handle = (evt.srcElement || evt.target);
        var offset = pacem_core_1.PacemUtils.offset(this.handle);
        this.startPosition = { x: offset.left, y: offset.top };
    };
    PacemBindComponent.prototype.drag = function (evt) {
        if (!this.startPoint)
            return;
        evt.preventDefault();
        evt.stopPropagation();
        this.handle.style.left = (this.startPosition.x - (this.startPoint.x - evt.pageX)) + 'px';
        this.handle.style.top = (this.startPosition.y - (this.startPoint.y - evt.pageY)) + 'px';
        //
        this.trigger.refresh();
    };
    PacemBindComponent.prototype.drop = function (evt) {
        if (this.startPoint) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        this.startPoint = null;
    };
    __decorate([
        core_1.ViewChild('target'), 
        __metadata('design:type', pacem_ui_1.PacemBindTarget)
    ], PacemBindComponent.prototype, "trigger", void 0);
    PacemBindComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-bind',
            template: "<h2>Pacem Bind</h2>\n<div>\n\n<div class=\"target\" pacemBindTarget=\"target\" #target=\"pacemBindTarget\"></div>\n\n<div class=\"target source\" pacemBindTarget=\"targetAndSource\" [pacemBindTargets]=\"[{key: 'target', from: 'bottom', to: 'top', css: 'fixed'}]\"\n     (mousedown)=\"startDrag($event)\" (mousemove)=\"drag($event)\" (mouseup)=\"drop($event)\"></div>\n\n<div class=\"source\" [pacemBindTargets]=\"['target']\" (mousedown)=\"startDrag($event)\" (mousemove)=\"drag($event)\" (mouseup)=\"drop($event)\"></div>\n<div class=\"source\" [pacemBindTargets]=\"[{key: 'target3d', from: 'left', to: 'bottom', css: 'fixed'},\n{key: 'targetAndSource', from: 'bottom', to: 'top', css: 'fixed'}]\" (mousedown)=\"startDrag($event)\" (mousemove)=\"drag($event)\" (mouseup)=\"drop($event)\"></div>\n\n\n<pacem-3d orbit=\"true\" (sceneupdated)=\"refresh()\">\n<pacem-3d-object pacemBindTarget=\"target3d\" [object]=\"obj\" position=\"0,.0,0\"></pacem-3d-object>\n</pacem-3d>\n\n\n</div>",
            styles: [
                '.target, .source{ position: absolute; width: 100px; height: 100px; }',
                '.target { top: 450px; left: 450px; background: #f00; }',
                '.source { top: 250px; left: 250px; background: #080; cursor: move; }',
                '.source.target { background: #fc0; top: 250px; left: 450px;  }',
                '.source:nth-child(2n) { top: 275px; left: 450px; }'
            ] /*,
            entryComponents: [Pacem3D, PacemBindTarget, PacemBindTargets]*/
        }), 
        __metadata('design:paramtypes', [pacem_ui_1.PacemBindService])
    ], PacemBindComponent);
    return PacemBindComponent;
}());
exports.PacemBindComponent = PacemBindComponent;
