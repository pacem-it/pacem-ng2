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
var PacemChartsComponent = (function () {
    function PacemChartsComponent() {
        this.value1 = 50.0;
        this.value2 = 25.0;
        this.value3 = 75.0;
        this.value4 = 50.0;
    }
    return PacemChartsComponent;
}());
PacemChartsComponent = __decorate([
    core_1.Component({
        selector: 'app-pacem-charts',
        template: "<h2 class=\"pacem-animatable\">Pacem Charts</h2>\n\n<p class=\"pacem-animatable\">Modify the inputs and see the triple-folded chart updating live.</p>\n\n    <pacem-ring-chart>\n        <pacem-ring-chart-item [value]=\"value1\"></pacem-ring-chart-item>\n        <pacem-ring-chart-item [value]=\"value2\"></pacem-ring-chart-item>\n        <pacem-ring-chart-item [value]=\"value3\"></pacem-ring-chart-item>\n        <pacem-ring-chart-item [value]=\"value4\"></pacem-ring-chart-item>\n    </pacem-ring-chart>\n\n<p class=\"pacem-animatable\">The following chart allow interaction in order to modify the value \"graphically\".</p>\n\n    <pacem-ring-chart>\n        <pacem-ring-chart-item [(value)]=\"value4\" interactive=\"true\" round=\"0\"></pacem-ring-chart-item>\n    </pacem-ring-chart>\n\n<p class=\"pacem-animatable\">Same input values trigger the redraw of the following pie-chart as well.</p>\n\n    <pacem-pie-chart>\n        <pacem-pie-chart-slice [value]=\"value1\"></pacem-pie-chart-slice>\n        <pacem-pie-chart-slice [value]=\"value2\"></pacem-pie-chart-slice>\n        <pacem-pie-chart-slice [value]=\"value3\"></pacem-pie-chart-slice>\n        <pacem-pie-chart-slice [value]=\"value4\"></pacem-pie-chart-slice>\n    </pacem-pie-chart>\n    \n    <ol style=\"margin-top: 1em\" class=\"pacem-field\">\n    <li class=\"pacem-input-container\"><input class=\"pacem-input\" type=\"number\" required [(ngModel)]=\"value1\" max=\"100\" min=\"0\" /></li>\n    <li class=\"pacem-input-container\"><input class=\"pacem-input\" type=\"number\" required [(ngModel)]=\"value2\" max=\"100\" min=\"0\" /></li>\n    <li class=\"pacem-input-container\"><input class=\"pacem-input\" type=\"number\" required [(ngModel)]=\"value3\" max=\"100\" min=\"0\" /></li>\n    <li class=\"pacem-input-container\"><input class=\"pacem-input\" type=\"number\" required [(ngModel)]=\"value4\" max=\"100\" min=\"0\" /></li>\n</ol>\n" /*,
            entryComponents: [PacemRingChart, PacemRingChartItem, PacemPieChart]*/
    }),
    __metadata("design:paramtypes", [])
], PacemChartsComponent);
exports.PacemChartsComponent = PacemChartsComponent;
