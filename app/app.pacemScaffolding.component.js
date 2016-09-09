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
var pacem_core_1 = require('./../pacem/pacem-core');
var pacem_net_1 = require('./../pacem/pacem-net');
var core_1 = require('@angular/core');
var PacemScaffoldingComponent = (function () {
    function PacemScaffoldingComponent(ref, looper, http) {
        this.ref = ref;
        this.looper = looper;
        this.http = http;
        this.meta = [];
        this.entity = {
            Name: 'Cristian', Resume: 'Your <b>CV</b> here...', Birthdate: '2015-07-08T09:58:00.000Z',
            FavFood: "ice cream",
        };
    }
    PacemScaffoldingComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.http.get('metadata.json')
            .success(function (responseText) {
            var meta = JSON.parse(responseText);
            _this.looper.loop(meta, function (item) {
                _this.meta.push(item);
            });
        });
    };
    PacemScaffoldingComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-scaffolding',
            template: "<h2>Pacem Scaffolding</h2>\n<p>Many input data types (and more to come) are involved in this self-composing form system.<br />\nIt includes styling, custom validation and fetching for complex data.</p>\n    <form>\n    <pacem-field *ngFor=\"let item of meta\" [field]=\"item\" [entity]=\"entity\"></pacem-field>\n    <p>{{ entity | json }}</p>\n    \n<p>This is the readonly version synchronized with the form above:</p>\n\n    <pacem-field *ngFor=\"let item of meta\" readonly=\"true\" [field]=\"item\" [entity]=\"entity\"></pacem-field>\n    </form>\n\n",
            providers: [pacem_core_1.PacemLooper, pacem_net_1.PacemHttp] /*,
            entryComponents: [PacemField]*/
        }), 
        __metadata('design:paramtypes', [core_1.ChangeDetectorRef, pacem_core_1.PacemLooper, pacem_net_1.PacemHttp])
    ], PacemScaffoldingComponent);
    return PacemScaffoldingComponent;
}());
exports.PacemScaffoldingComponent = PacemScaffoldingComponent;
