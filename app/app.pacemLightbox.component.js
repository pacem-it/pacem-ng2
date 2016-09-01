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
            { url: 'http://www.thestatesman.co.in/wp-content/uploads/2016/07/Rio-Olympics-2016-Swimming.jpg', caption: 'Swimming pool' },
            { url: 'http://img.bleacherreport.net/img/images/photos/003/608/549/hi-res-8515ecf0199d2a62a2855eaa4ebcf91c_crop_north.jpg?w=630&h=420&q=75', caption: 'Michael Phelps' },
        ];
    }
    PacemLightboxComponent.prototype.addPic = function (evt) {
        if (this.pictures.length < 3) {
            this.pictures.push({
                url: 'https://smsprio2016-a.akamaihd.net/sport/c5IThfPJ.jpg',
                caption: 'Down by the water'
            });
            this.message = "Extra pic has been added!";
            this.toast.show();
        }
    };
    PacemLightboxComponent.prototype.removePic = function (evt) {
        if (this.pictures.length >= 3) {
            this.pictures.splice(2);
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
            template: "<h2>Pacem Lightbox</h2>\n<p>Toggle <i>lightboxes</i> and picture <i>galleries</i> visibility using the buttons below.<br />\nThe <b>add</b>/<b>remove</b> picture button will trigger a <i>toast</i> message.</p>\n<button (click)=\"visible=true\">Lightbox</button>\n<button (click)=\"galleryVisible=true\">Gallery</button>\n<button (click)=\"addPic($event)\" [hidden]=\"pictures.length > 2\">Add picture</button>\n<button (click)=\"removePic($event)\" [hidden]=\"pictures.length <= 2\">Remove picture</button>\n\n<pacem-lightbox [show]=\"visible\" (close)=\"visible=false\">\n    <p>Lightbox content</p>\n</pacem-lightbox>\n\n<pacem-gallery [show]=\"galleryVisible\" startIndex=\"1\" (close)=\"galleryVisible=false\">\n    <pacem-gallery-item *ngFor=\"let pic of pictures, let i = index\" [url]=\"pic.url\" [caption]=\"'('+ (i+1) +'/'+ (pictures.length) +') - '+ pic.caption\"></pacem-gallery-item>\n</pacem-gallery>\n\n<pacem-toast #toast>\n    {{ message }}\n</pacem-toast>\n",
            directives: [pacem_ui_1.PacemLightbox, pacem_ui_1.PacemGallery, pacem_ui_1.PacemGalleryItem, pacem_ui_1.PacemToast]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemLightboxComponent);
    return PacemLightboxComponent;
}());
exports.PacemLightboxComponent = PacemLightboxComponent;
