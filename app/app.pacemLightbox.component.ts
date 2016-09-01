import { Component, ViewChild } from '@angular/core';
import { PacemLightbox, PacemGallery, PacemGalleryItem, PacemToast } from './../pacem/pacem-ui';

@Component({
    selector: 'app-pacem-lightbox',
    template: `<h2>Pacem Lightbox</h2>
<p>Toggle <i>lightboxes</i> and picture <i>galleries</i> visibility using the buttons below.<br />
The <b>add</b>/<b>remove</b> picture button will trigger a <i>toast</i> message.</p>
<button (click)="visible=true">Lightbox</button>
<button (click)="galleryVisible=true">Gallery</button>
<button (click)="addPic($event)" [hidden]="pictures.length > 2">Add picture</button>
<button (click)="removePic($event)" [hidden]="pictures.length <= 2">Remove picture</button>

<pacem-lightbox [show]="visible" (close)="visible=false">
    <p>Lightbox content</p>
</pacem-lightbox>

<pacem-gallery [show]="galleryVisible" startIndex="1" (close)="galleryVisible=false">
    <pacem-gallery-item *ngFor="let pic of pictures, let i = index" [url]="pic.url" [caption]="'('+ (i+1) +'/'+ (pictures.length) +') - '+ pic.caption"></pacem-gallery-item>
</pacem-gallery>

<pacem-toast #toast>
    {{ message }}
</pacem-toast>
`,
    directives: [PacemLightbox, PacemGallery, PacemGalleryItem, PacemToast]
})
export class PacemLightboxComponent {

    private visible: boolean = false;
    private message: string;
    @ViewChild('toast') toast: PacemToast;

    addPic(evt: MouseEvent) {
        if (this.pictures.length < 3) {
            this.pictures.push({
                url: 'https://smsprio2016-a.akamaihd.net/sport/c5IThfPJ.jpg',
                caption: 'Down by the water'
            });
            this.message = `Extra pic has been added!`;
            this.toast.show();
        }
    }

    removePic(evt: MouseEvent) {
        if (this.pictures.length >= 3) {
            this.pictures.splice(2);
            this.message = `Extra pic has been removed!`;
            this.toast.show();
        }
    }

    private pictures: { url: string, caption: string }[] = [
        { url: 'http://www.thestatesman.co.in/wp-content/uploads/2016/07/Rio-Olympics-2016-Swimming.jpg', caption: 'Swimming pool' },
        { url: 'http://img.bleacherreport.net/img/images/photos/003/608/549/hi-res-8515ecf0199d2a62a2855eaa4ebcf91c_crop_north.jpg?w=630&h=420&q=75', caption: 'Michael Phelps' },
    ];
}