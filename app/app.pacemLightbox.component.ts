import { Component, ViewChild } from '@angular/core';
import { PacemLightbox, PacemGallery, PacemGalleryItem, PacemToast } from './../pacem/pacem-ui';

@Component({
    selector: 'app-pacem-lightbox',
    template: `<h2>Pacem Lightbox</h2>
<p>Toggle <i>lightboxes</i> and picture <i>galleries</i> visibility using the buttons below.<br />
The <b>add</b>/<b>remove</b> picture button will trigger a <i>toast</i> message.</p>
<button (click)="visible=true">Lightbox</button>
<button (click)="galleryVisible=true">Gallery</button>
<button (click)="addPic($event)" [hidden]="pictures.length > 3">Add picture</button>
<button (click)="removePic($event)" [hidden]="pictures.length <= 3">Remove picture</button>

<pacem-lightbox [show]="visible" (close)="visible=false">
    <p>Lightbox content</p>
</pacem-lightbox>

<pacem-gallery [show]="galleryVisible" (close)="galleryVisible=false" [startIndex]="1">
    <pacem-gallery-item *ngFor="let pic of pictures, let i = index" [url]="pic.url" [caption]="'('+ (i+1) +'/'+ (pictures.length) +') - '+ pic.caption"></pacem-gallery-item>
</pacem-gallery>

<p><b>Carousel</b> (below) is a fully customizable flexible component, that might need some extra DOM and css tuning due to its templatable layout. 
In this case we reuse the datasource of the pic gallery.</p>

<div style="position: relative;"></div>
<ol [pacemCarousel]="{ 'interactive': true, 'interval': 2500 }" #carousel="pacemCarousel">
    <li *ngFor="let item of pictures, let ndx = index" class="carousel-item" pacemCarouselItem #carouselItem="pacemCarouselItem">
        <div *ngIf="carouselItem.near" (click)="test(item.caption, $event)" class="oblo" [ngStyle]="{ 'background-image': 'url('+ item.url +')'}"></div>
        <span>{{ item.caption }}</span>
    </li>
</ol>


<pacem-toast #toast>
    {{ message }}
</pacem-toast>
`,
    entryComponents: [PacemLightbox, PacemGallery, PacemToast],
    styles: [
        '.pacem-carousel{ width: 156px; height: 108px; }',
        `.carousel-item{ left: 24px; display: inline-block; width: 108px; height: 108px; font-size: 0; }`,
        `.pacem-carousel-item:not(.pacem-carousel-active){ opacity: 0; }`, // <- local tuning due to the rounded shapes
        `.oblo{ width: 100%; height: 100%;border-radius: 50%; cursor: pointer;
            background-size: cover; background-position: center center;}`]
})
export class PacemLightboxComponent {

    private visible: boolean = false;
    private message: string;
    @ViewChild('toast') toast: PacemToast;

    test(msg, evt) {
        console.info('pointer-events test succeeded: '+ msg);
    }

    addPic(evt: MouseEvent) {
        if (this.pictures.length < 4) {
            this.pictures.push({
                url: 'https://smsprio2016-a.akamaihd.net/sport/c5IThfPJ.jpg',
                caption: 'Down by the water'
            });
            this.message = `Extra pic has been added!`;
            this.toast.show();
        }
    }

    removePic(evt: MouseEvent) {
        if (this.pictures.length >= 4) {
            this.pictures.splice(3);
            this.message = `Extra pic has been removed!`;
            this.toast.show();
        }
    }

    private pictures: { url: string, caption: string }[] = [
        { url: 'http://img.gmw.cn/images/attachement/jpg/site2/20120801/14feb5e0a4a31182c9ed01.jpg', caption: 'Sun yang'},
        { url: 'http://www.thestatesman.co.in/wp-content/uploads/2016/07/Rio-Olympics-2016-Swimming.jpg', caption: 'Swimming pool' },
        { url: 'http://img.bleacherreport.net/img/images/photos/003/608/549/hi-res-8515ecf0199d2a62a2855eaa4ebcf91c_crop_north.jpg?w=630&h=420&q=75', caption: 'Michael Phelps' },
    ];
}