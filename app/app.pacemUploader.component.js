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
var pacem_ui_1 = require('./../pacem/pacem-ui');
var core_1 = require('@angular/core');
var baseUrl = 'uploader.ashx';
var PacemUploaderComponent = (function () {
    function PacemUploaderComponent(renderer) {
        this.renderer = renderer;
        this.startUrl = baseUrl + "?what=start";
        this.doUrl = baseUrl + "?what=do";
        this.undoUrl = baseUrl + "?what=undo";
    }
    PacemUploaderComponent.prototype.upload = function (dataUrl) {
        var buffer = pacem_core_1.PacemUtils.dataURLToBlob(dataUrl);
        var f = new File([buffer], 'snapshot.jpg');
        this.uploader.upload(f);
    };
    PacemUploaderComponent.prototype.ngAfterViewInit = function () {
    };
    PacemUploaderComponent.prototype.complete = function (evt) {
        console.info(JSON.stringify(evt));
    };
    __decorate([
        core_1.ViewChild('uploader'), 
        __metadata('design:type', pacem_ui_1.PacemUploader)
    ], PacemUploaderComponent.prototype, "uploader", void 0);
    PacemUploaderComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-uploader',
            template: "<h2>Pacem Uploader</h2>\n\n<p>Select a file from your storage and send it for upload.<br />\nJust by selecting it, the upload process starts.</p>\n\n<div style=\"position: relative; width: 108px; height: 108px;\">\n<pacem-ring-chart #chart>\n    <pacem-ring-chart-item [value]=\"uploader.percentage\"></pacem-ring-chart-item>\n</pacem-ring-chart>\n<form style=\"position: absolute; width: 32px; height: 32px; top: 50%; left: 50%; margin-top: -16px; margin-left: -16px\" #form>\n    <pacem-uploader [startUrl]=\"startUrl\"\n                    [uploadUrl]=\"doUrl\" \n                    [undoUrl]=\"undoUrl\" \n                    pattern=\"(jpg|png|pdf)$\"\n                    (complete)=\"complete($event)\"\n                    #uploader></pacem-uploader>\n</form></div>\n    <div [hidden]=\"!uploader.invalidFile\">File non valido! ({{ uploader.pattern }})</div>\n\n<h2>Pacem Snapshot</h2>\n<p>Pick a snapshot from you <b>webcam</b> and send it to the uploader</p>\n\n<pacem-snapshot (select)=\"upload($event)\">\nWebcam access is <b>impossile</b> on this machine!\n</pacem-snapshot>\n<p>The style provided along with the <i>snapshot</i> component automatically changes its size based on the status of the process.</p>\n",
            entryComponents: [pacem_ui_1.PacemUploader, pacem_ui_1.PacemSnapshot]
        }), 
        __metadata('design:paramtypes', [core_1.Renderer])
    ], PacemUploaderComponent);
    return PacemUploaderComponent;
}());
exports.PacemUploaderComponent = PacemUploaderComponent;
