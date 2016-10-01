import { Component, ViewChild, OnInit } from '@angular/core';
import { PacemLightbox, PacemGallery, PacemGalleryItem, PacemToast } from './../pacem/pacem-ui';
import { PacemHttp } from './../pacem/pacem-net';

@Component({
    selector: 'app-pacem-lightbox',
    template: `<h2 class="pacem-animatable">Pacem Lightbox</h2>
<p class="pacem-animatable">Toggle <i>lightboxes</i> and picture <i>galleries</i> visibility using the buttons below.<br />
The <b>add</b>/<b>remove</b> picture button will trigger a <i>toast</i> message.</p>
<button class="pacem-btn" (click)="visible=true">Lightbox</button>
<button class="pacem-btn" (click)="galleryVisible=true">Gallery</button>
<button class="pacem-btn" (click)="addPic($event)" [hidden]="pictures?.length >= size">Add picture</button>
<button class="pacem-btn" (click)="removePic($event)" [hidden]="pictures?.length < size">Remove picture</button>

<pacem-lightbox [show]="visible" (close)="visible=false">
    <p>Lightbox content</p>
</pacem-lightbox>

<pacem-gallery [show]="galleryVisible" (close)="galleryVisible=false" [startIndex]="1">
    <pacem-gallery-item *ngFor="let pic of pictures, let i = index" [url]="pic.url" [caption]="'('+ (i+1) +'/'+ (pictures?.length) +') - '+ pic.caption"></pacem-gallery-item>
</pacem-gallery>

<p class="pacem-animatable"><b>Carousel</b> (below) is a fully customizable flexible component, that might need some extra DOM and css tuning due to its templatable layout. 
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
export class PacemLightboxComponent implements OnInit {

    private visible: boolean = false;
    private message: string;
    private size: number;
    private popped: { url: string, caption: string };
    @ViewChild('toast') toast: PacemToast;

    test(msg, evt) {
        console.info('pointer-events test succeeded: '+ msg);
    }

    constructor(private http: PacemHttp) { }

    ngOnInit() {
        this.http.get('gallery.json')
            .success((response) => {
                this.pictures = response.json;
                this.size = this.pictures.length;
            })
    }

    addPic(evt: MouseEvent) {
        if (this.pictures.length < this.size) {
            this.pictures.push(this.popped);
            this.message = `Extra pic has been added!`;
            this.toast.show();
        }
    }

    removePic(evt: MouseEvent) {
        if (this.pictures.length >= this.size) {
            this.popped = this.pictures.pop();
            this.message = `Extra pic has been removed!`;
            this.toast.show();
        }
    }

    private pictures: { url: string, caption: string }[];
}