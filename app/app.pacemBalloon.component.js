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
var pacem_ui_1 = require('./../pacem/pacem-ui');
var forms_1 = require('@angular/forms');
var PacemBalloonComponent = (function () {
    function PacemBalloonComponent() {
        this.model = { position: 'top', trigger: 'hover', behavior: 'menu' };
    }
    PacemBalloonComponent.prototype.ngOnInit = function () {
        this.balloonName = 'balloon1';
    };
    Object.defineProperty(PacemBalloonComponent.prototype, "balloonName", {
        get: function () {
            return this.balloon.id;
        },
        set: function (v) {
            this.balloon = this[v || 'balloon1'].nativeElement;
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.ViewChild('balloon1'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemBalloonComponent.prototype, "balloon1", void 0);
    __decorate([
        core_1.ViewChild('balloon2'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemBalloonComponent.prototype, "balloon2", void 0);
    PacemBalloonComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-balloon',
            template: "<h2>Pacem Balloon</h2>\n\n<div>\n<input type=\"radio\" [(ngModel)]=\"model.trigger\" name=\"trig\" id=\"trigHover\" value=\"hover\" /><label for=\"trigHover\">hover</label>\n<input type=\"radio\" [(ngModel)]=\"model.trigger\" name=\"trig\" id=\"trigClick\" value=\"click\" /><label for=\"trigClick\">click</label>\n</div>\n<div>\n<input type=\"radio\" [(ngModel)]=\"model.behavior\" name=\"beh\" id=\"behMenu\" value=\"menu\" /><label for=\"behMenu\">menu-like</label>\n<input type=\"radio\" [(ngModel)]=\"model.behavior\" name=\"beh\" id=\"behTip\" value=\"tooltip\" /><label for=\"behTip\">tooltip</label>\n</div>\n<div>\n<input type=\"radio\" [(ngModel)]=\"balloonName\" name=\"b\" id=\"b1\" value=\"balloon1\" /><label for=\"b1\">balloon 1</label>\n<input type=\"radio\" [(ngModel)]=\"balloonName\" name=\"b\" id=\"b2\" value=\"balloon2\" /><label for=\"b2\">balloon 2</label>\n</div>\n<div>\n<input type=\"radio\" [(ngModel)]=\"model.position\" name=\"pos\" id=\"posTop\" value=\"top\" /><label for=\"posTop\">top</label>\n<input type=\"radio\" [(ngModel)]=\"model.position\" name=\"pos\" id=\"posLeft\" value=\"left\" /><label for=\"posLeft\">left</label>\n<input type=\"radio\" [(ngModel)]=\"model.position\" name=\"pos\" id=\"posBottom\" value=\"bottom\" /><label for=\"posBottom\">bottom</label>\n<input type=\"radio\" [(ngModel)]=\"model.position\" name=\"pos\" id=\"posRight\" value=\"right\" /><label for=\"posRight\">right</label>\n<input type=\"radio\" [(ngModel)]=\"model.position\" name=\"pos\" id=\"posAuto\" value=\"auto\" /><label for=\"posAuto\">auto</label>\n</div>\n\n<span [pacemBalloon]=\"balloon\" [pacemBalloonOptions]=\"model\"><u>{{ model.trigger == 'hover'? 'MouseOver' : 'Click' }} here</u> for balloon</span>\n<br />\n<span pacemBalloon=\"#balloon1\" [pacemBalloonOptions]=\"model\"><u>{{ model.trigger == 'hover'? 'MouseOver' : 'Click' }} here</u> for balloon 1</span>\n\n<div id=\"balloon1\" #balloon1 hidden>\n    This is the <b>1st</b> {{ model.position }}-positioned balloon!\n</div>\n<div id=\"balloon2\" #balloon2 hidden>\n    This is the <b>2nd</b> {{ model.position }}-positioned balloon!\n</div>\n",
            directives: [pacem_ui_1.PacemBalloon, forms_1.NgForm]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemBalloonComponent);
    return PacemBalloonComponent;
}());
exports.PacemBalloonComponent = PacemBalloonComponent;
