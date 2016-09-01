import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PacemMap, PacemMapMarker, PacemMapCircle, PacemMapLink, PacemMapPolyline } from './../pacem/pacem-maps-leaflet';
import { PacemHighlight } from './../pacem/pacem-ui';
import { PacemPromise, PacemUtils } from './../pacem/pacem-core';

@Component({
    selector: 'app-pacem-map',
    template: `<h2>Pacem Map</h2>
<div #container (window:resize)="onResize($event)"><pacem-map>
    <pacem-map-polyline [stroke]="'yellow'" [path]="steps">I'm a polyline!</pacem-map-polyline>
    <pacem-map-circle [center]="hereSpot" [radius]="hereInfluence">Influence of <b>{{ (hereInfluence * 0.001) }}</b>km radius</pacem-map-circle>
    <pacem-map-marker [position]="hereSpot">I'm <b>here</b>!</pacem-map-marker>
    <pacem-map-marker [position]="plungeSpot" (drag)="onDrag($event)" [draggable]="true">
        Plunge here!
        <br />(<pacem-map-link [target]="plungeSpot">navigate</pacem-map-link>)
    </pacem-map-marker>
    <pacem-map-marker *ngFor="let marker of markers; let i=index" [position]="marker.pos" 
        (info)="setupInfo(i)"
        (close)="spliceMarker(i)"><div [innerHTML]="marker.desc | pacemHighlight:(i+1).toString()"></div></pacem-map-marker>
</pacem-map></div>`,
    directives: [PacemMap, PacemMapMarker, PacemMapCircle, PacemMapLink, PacemMapPolyline],
    pipes: [PacemHighlight],
    providers: [PacemPromise],
    inputs: ['markers', 'steps']
})
export class PacemMapComponent implements AfterViewInit {


    @ViewChild("container") container: ElementRef;


    ngAfterViewInit() {
        this.initialized = true;
        this.onResize();
    }

    private onResize(evt?: Event) {
        if (!this.initialized) return;
        var offset = PacemUtils.offset(this.container.nativeElement), win = window;
        var viewportHeight = win.innerHeight || win.document.documentElement.clientHeight || win.document.body.clientHeight || 0;
        this.container.nativeElement.style.width = '100%';
        this.container.nativeElement.style.height = (viewportHeight - offset.top)+'px';
    }

    private initialized: boolean;
    hereSpot: string = '44.714188025077984,10.296516444873811';
    hereInfluence: number = 10000; // meters
    plungeSpot: number[] = [44, 10];
    onDrag(evt) {
        console.log(evt.position);
        this.plungeSpot = [evt.position.lat, evt.position.lng];
        this.refreshSteps();
    }
    markers: { pos: number[], desc: string }[] = [
        { pos: [43, 9], desc: '<b>Primo</b> elemento' },
        { pos: [42, 8], desc: '<b>Secondo</b> elemento' },
        { pos: [41, 7], desc: '<b>Terzo</b> elemento' },
        { pos: [40, 9], desc: '<b>Quarto</b> elemento' },
    ];
    constructor() {
        this.refreshSteps();
        //
        /*var deferred = PacemPromise.defer();
        deferred.promise.success(v => alert(v));
        setTimeout(()=>deferred.resolve('hello pacemjs!'), 2500);*/

    }
    steps: number[][] = [];
    spliceMarker(ndx) {
        this.markers.splice(ndx, 1);
        this.refreshSteps();
    }
    setupInfo(ndx) {
        this.markers[ndx].desc = 'This is the info #<b>' + (ndx + 1) + '</b>';
    }
    private refreshSteps() {
        this.steps = [this.plungeSpot].concat(this.markers.map(m => m.pos));
    }
}