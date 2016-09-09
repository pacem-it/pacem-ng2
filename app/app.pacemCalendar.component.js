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
var PacemCalendarComponent = (function () {
    function PacemCalendarComponent() {
        this.now = new Date();
        this.min0 = new Date(-76, 1, 1);
    }
    PacemCalendarComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-calendar',
            template: "<h2>Pacem Datetime Picker</h2>\n<p>Custom <i>datepicker</i> component.<br />\nStandard version:</p>\n\n<pacem-datetime-picker [(dateValue)]=\"value\"></pacem-datetime-picker>\n\n<p>Minute-level precision:</p>\n\n<pacem-datetime-picker precision=\"minute\" [(dateValue)]=\"value\"></pacem-datetime-picker>\n\n<p>Second-level precision:</p>\n\n<pacem-datetime-picker precision=\"second\" [(dateValue)]=\"value\"></pacem-datetime-picker>\n\n<p>Challenging ancient times:</p>\n\n<pacem-datetime-picker precision=\"minute\" [min]=\"min0\" [max]=\"value || now\" [(dateValue)]=\"value0\"></pacem-datetime-picker>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], PacemCalendarComponent);
    return PacemCalendarComponent;
}());
exports.PacemCalendarComponent = PacemCalendarComponent;
