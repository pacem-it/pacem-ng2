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
var PerfComponent = (function () {
    function PerfComponent() {
        this.items = [];
        var arr = [];
        for (var j = 0; j < 1000; j++)
            arr.push('');
        this.items = arr;
    }
    PerfComponent.prototype.ngOnInit = function () {
        var _this = this;
        this._handle = window.setInterval(function () {
            _this.time = new Date().toISOString();
        }, 20);
    };
    PerfComponent.prototype.ngOnDestroy = function () {
        window.clearInterval(this._handle);
    };
    return PerfComponent;
}());
PerfComponent = __decorate([
    core_1.Component({
        selector: 'pacem-perf',
        template: "<h2 class=\"pacem-animatable\">Performance Test</h2>\n<p class=\"pacem-animatable\">This is a to-be-removed page, meant only to watch performances compared to PacemJS framework.</p>\n<span *ngFor=\"let i of items\">{{ time }}</span>\n",
    }),
    __metadata("design:paramtypes", [])
], PerfComponent);
exports.PerfComponent = PerfComponent;
