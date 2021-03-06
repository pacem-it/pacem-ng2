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
var pacem_core_1 = require("./../pacem/pacem-core");
var pacem_net_1 = require("./../pacem/pacem-net");
var core_1 = require("@angular/core");
var PacemScaffoldingComponent = (function () {
    function PacemScaffoldingComponent(ref, looper, http) {
        this.ref = ref;
        this.looper = looper;
        this.http = http;
        this.readonly = true;
        this.meta = [];
        this.entity = {
            Name: 'Sebastian', Resume: 'Your <b>CV</b> here...', Birthdate: '2015-07-08T09:58:00.000Z', Sex: 0,
            FavFood: "ice cream",
        };
    }
    PacemScaffoldingComponent.prototype.check = function (form) {
        console.log(form.valid ? 'VALID' : 'INVALID');
    };
    Object.defineProperty(PacemScaffoldingComponent.prototype, "params", {
        get: function () {
            return { culture: 'it' };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemScaffoldingComponent.prototype, "foodsPromise", {
        get: function () {
            var deferred = pacem_core_1.PacemPromise.defer();
            this.http.get('foods.json').success(function (response) {
                var json = response.json;
                var array = json.result;
                deferred.resolve(array.map(function (food) { return { caption: food, value: food, entity: food }; }));
            });
            return deferred.promise;
        },
        enumerable: true,
        configurable: true
    });
    PacemScaffoldingComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.http.get('metadata.json')
            .success(function (response) {
            var meta = response.json;
            var iterator = function (item) {
                if (item.prop === 'FavFood')
                    item.extra.fetch = _this.foodsPromise;
            };
            //this.looper.loop(meta, (item) => {
            //    iterator(item);
            //    this.meta.push(item);
            //});
            meta.forEach(iterator);
            _this.meta = meta;
        });
    };
    return PacemScaffoldingComponent;
}());
PacemScaffoldingComponent = __decorate([
    core_1.Component({
        selector: 'app-pacem-scaffolding',
        template: "<h2 class=\"pacem-animatable\">Pacem Scaffolding</h2>\n<p class=\"pacem-animatable\">Many input data types (and more to come) are involved in this self-composing form system.<br />\nIt includes styling, custom validation and fetching for complex data.</p>\n\n<!--<form>\n    <pacem-datetime-picker name=\"Birthdate\" [(ngModel)]=\"entity.Birthdate\"></pacem-datetime-picker>\n</form>-->\n\n    <button (click)=\"readonly=!readonly\" class=\"pacem-btn\">toggle readonly</button>\n\n    <form #f=\"ngForm\" novalidate (ngSubmit)=\"check(f)\">\n    <pacem-field    *ngFor=\"let item of meta\" [field]=\"item\" [entity]=\"entity\" [readonly]=\"readonly\"\n                    [params]=\"params\" \n                    [form]=\"f\">\n    </pacem-field>\n    <p>{{ entity | json }}</p>\n    \n    <div [hidden]=\"readonly\">\n    <input type=\"submit\" value=\"submit\" class=\"pacem-btn primary\" [disabled]=\"f.pristine || f.invalid\" />\n\n    <b>{{ ( f.valid ? 'valid': 'invalid' ) }}</b> and <b>{{ (f.pristine ?  'pristine' : 'dirty') }}</b></div>\n\n    </form>\n\n",
        providers: [pacem_core_1.PacemLooper, pacem_net_1.PacemHttp]
    }),
    __metadata("design:paramtypes", [core_1.ChangeDetectorRef, pacem_core_1.PacemLooper, pacem_net_1.PacemHttp])
], PacemScaffoldingComponent);
exports.PacemScaffoldingComponent = PacemScaffoldingComponent;
