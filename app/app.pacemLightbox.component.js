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
var PacemLightboxComponent = (function () {
    function PacemLightboxComponent() {
        this.visible = false;
        this.pictures = [
            { url: 'http://img.gmw.cn/images/attachement/jpg/site2/20120801/14feb5e0a4a31182c9ed01.jpg', caption: 'Sun yang' },
            { url: 'http://www.thestatesman.co.in/wp-content/uploads/2016/07/Rio-Olympics-2016-Swimming.jpg', caption: 'Swimming pool' },
            { url: 'http://img.bleacherreport.net/img/images/photos/003/608/549/hi-res-8515ecf0199d2a62a2855eaa4ebcf91c_crop_north.jpg?w=630&h=420&q=75', caption: 'Michael Phelps' },
        ];
    }
    PacemLightboxComponent.prototype.test = function (msg, evt) {
        console.info('pointer-events test succeeded: ' + msg);
    };
    PacemLightboxComponent.prototype.addPic = function (evt) {
        if (this.pictures.length < 4) {
            this.pictures.push({
                url: 'https://smsprio2016-a.akamaihd.net/sport/c5IThfPJ.jpg',
                caption: 'Down by the water'
            });
            this.message = "Extra pic has been added!";
            this.toast.show();
        }
    };
    PacemLightboxComponent.prototype.removePic = function (evt) {
        if (this.pictures.length >= 4) {
            this.pictures.splice(3);
            this.message = "Extra pic has been removed!";
            this.toast.show();
        }
    };
    __decorate([
        core_1.ViewChild('toast'), 
        __metadata('design:type', pacem_ui_1.PacemToast)
    ], PacemLightboxComponent.prototype, "toast", void 0);
    PacemLightboxComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-lightbox',
            template: "<h2>Pacem Lightbox</h2>\n<p>Toggle <i>lightboxes</i> and picture <i>galleries</i> visibility using the buttons below.<br />\nThe <b>add</b>/<b>remove</b> picture button will trigger a <i>toast</i> message.</p>\n<button (click)=\"visible=true\">Lightbox</button>\n<button (click)=\"galleryVisible=true\">Gallery</button>\n<button (click)=\"addPic($event)\" [hidden]=\"pictures.length > 3\">Add picture</button>\n<button (click)=\"removePic($event)\" [hidden]=\"pictures.length <= 3\">Remove picture</button>\n\n<pacem-lightbox [show]=\"visible\" (close)=\"visible=false\">\n    <p>Lightbox content</p>\n</pacem-lightbox>\n\n<pacem-gallery [show]=\"galleryVisible\" (close)=\"galleryVisible=false\" [startIndex]=\"1\">\n    <pacem-gallery-item *ngFor=\"let pic of pictures, let i = index\" [url]=\"pic.url\" [caption]=\"'('+ (i+1) +'/'+ (pictures.length) +') - '+ pic.caption\"></pacem-gallery-item>\n</pacem-gallery>\n\n<p><b>Carousel</b> (below) is a fully customizable flexible component, that might need some extra DOM and css tuning due to its templatable layout. \nIn this case we reuse the datasource of the pic gallery.</p>\n\n<div style=\"position: relative;\"></div>\n<ol [pacemCarousel]=\"{ 'interactive': true, 'interval': 2500 }\" #carousel=\"pacemCarousel\">\n    <li *ngFor=\"let item of pictures, let ndx = index\" class=\"carousel-item\" pacemCarouselItem #carouselItem=\"pacemCarouselItem\">\n        <div *ngIf=\"carouselItem.near\" (click)=\"test(item.caption, $event)\" class=\"oblo\" [ngStyle]=\"{ 'background-image': 'url('+ item.url +')'}\"></div>\n        <span>{{ item.caption }}</span>\n    </li>\n</ol>\n\n\n<pacem-toast #toast>\n    {{ message }}\n</pacem-toast>\n",
            entryComponents: [pacem_ui_1.PacemLightbox, pacem_ui_1.PacemGallery, pacem_ui_1.PacemToast],
            styles: [
                '.pacem-carousel{ width: 156px; height: 108px; }',
                ".carousel-item{ left: 24px; display: inline-block; width: 108px; height: 108px; font-size: 0; }",
                ".pacem-carousel-item:not(.pacem-carousel-active){ opacity: 0; }",
                ".oblo{ width: 100%; height: 100%;border-radius: 50%; cursor: pointer;\n            background-size: cover; background-position: center center;}"]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemLightboxComponent);
    return PacemLightboxComponent;
}());
exports.PacemLightboxComponent = PacemLightboxComponent;
