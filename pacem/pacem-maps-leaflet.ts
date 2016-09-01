/// <reference path="../scripts/typings/leaflet/leaflet.d.ts" />
import {Component, Input, Directive, Output, EventEmitter, ViewChild, ElementRef, Renderer,
    AfterViewInit, AfterContentInit, ContentChildren, QueryList, SimpleChange } from '@angular/core';
import {DomSanitizationService, SafeUrl} from '@angular/platform-browser';

const consts = {
    TIMEOUT: 1000,
    MAP_SELECTOR: 'pacem-map',
    LINK_SELECTOR: 'pacem-map-link',
    MARKER_SELECTOR: 'pacem-map-marker',
    POLYLINE_SELECTOR: 'pacem-map-polyline',
    CIRCLE_SELECTOR: 'pacem-map-circle'
};
var utils = {
    parseCoords: function (input: string | number[]): number[] {
        if (input instanceof Array) return input;
        else if (/^\s*(\+|-)?[\d]+(.[\d]+)?\s*,\s*(\+|-)?[\d]+(.[\d]+)?\s*$/.test(input)) {
            var splitted = input.split(',');
            return [parseFloat(splitted[0]), parseFloat(splitted[1])];
        }
        return [0, 0];
    },
    expandBounds: function (bnds: any[], latLng: L.LatLng) {
        if (latLng)
            bnds.push([latLng.lat, latLng.lng]);
    },
    isContentEmpty: function (element: HTMLElement): boolean {
        return element.children.length == 0 || element.innerHTML == '<div></div>'; // TODO: investigate why ngContent adds empty div(?)
    }
};

//#region LINK
@Component({
    selector: consts.LINK_SELECTOR,
    template: '<a [href]="link"><ng-content></ng-content></a>'
})
export class PacemMapLink {
    @Input() target: string | number[] = '';

    private link: SafeUrl = '#';
    private sanitizer: DomSanitizationService = null;

    constructor(sanitizer: DomSanitizationService) {
        this.sanitizer = sanitizer;
    }

    ngOnChanges() {
        this.updateLink();
    }

    private updateLink() {
        var coords0 = utils.parseCoords(this.target);
        var coords = coords0[0] + ',' + coords0[1];
        var url = 'geo:' + coords;
        if ((/Windows/i.test(window.navigator.userAgent))) {
            url = 'ms-drive-to:?destination.latitude=' + coords0[0] + '&destination.longitude=' + coords0[1];
        }
        this.link = this.sanitizer.bypassSecurityTrustUrl(url);
    }
}
//#endregion

// #region MAP
@Component({
    selector: consts.MAP_SELECTOR,
    template: `<div class="pacem-map" #mapCanvas (window:resize)="onResize($event)"></div>`
})
export class PacemMap implements AfterContentInit {

    //#region properties
    @Input() zoom: number = 12;
    @Input() center: string = "44.714188025077984,10.296516444873811";

    @Input() tiles: string = '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    @Input() attribution: string = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    @Input() scale: boolean = true;
    /**
    * zoom control position
    */
    @Input() zoomControl: "topleft" | "topright" | "bottomleft" | "bottomright" = null;
    @Input() draggable: boolean = true;
    @Input() doubleClickZoom: boolean = true;
    @Input() keyboardShortcuts: boolean = true;

    @Input() paddingTop: number = 0;
    @Input() paddingLeft: number = 0;
    @Input() paddingRight: number = 0;
    @Input() paddingBottom: number = 0;

    //#endregion

    @Output('loaded') mapLoaded = new EventEmitter();

    @ViewChild('mapCanvas') canvas: ElementRef;

    //#region ctor
    constructor() {
    }
    //#endregion

    //#region fields
    private map: L.Map = null;
    private markers: L.Marker[] = [];
    private tileLayer: L.TileLayer = null;
    private shapes: L.Path[] = [];
    //#endregion

    //#region lifecycle
    ngOnChanges() {
        this.invalidateMapSize();
    }
    ngAfterContentInit() {
        this.initialize();
    }
    onResize() {
        this.invalidateMapSize();
    }
    //#endregion

    private _throttler: number = 0;
    private _resetThrottler() {
        clearTimeout(this._throttler);
        this._throttler = window.setTimeout(() => this._fitBounds(), consts.TIMEOUT);
    };
    // #region public methods
    getMap(): L.Map {
        return this.map;
    }
    addMarker(marker: L.Marker) {
        this._resetThrottler();
        this.markers.push(marker);
    }
    removeMarker(marker: L.Marker) {
        this._resetThrottler();
        this.markers.splice(this.markers.indexOf(marker), 1);
    }
    addShape(shape: L.Path) {
        this._resetThrottler();
        this.shapes.push(shape);
    }
    removeShape(shape: L.Path) {
        this._resetThrottler();
        this.shapes.splice(this.shapes.indexOf(shape), 1);
    }
    fitBounds() {
        this._resetThrottler();
    }
    // #endregion
    private _fitBounds() {
        if (!this.map) return;

        var ctrl = this;
        var markers = ctrl.markers, shapes = this.shapes;

        // no markers
        if (!markers.length && !shapes.length) {
            ctrl.map.setZoom(ctrl['zoom']);
            ctrl.map.setView(utils.parseCoords(ctrl['center']));
            return;
        }
        var bnds = [];
        for (var m of markers) {
            utils.expandBounds(bnds, m.getLatLng());
        }
        for (var s of shapes) {
            var bx = s.getBounds();
            utils.expandBounds(bnds, bx.getSouthWest());
            utils.expandBounds(bnds, bx.getNorthEast());
        }
        var minZoom;
        var paddingTop = this.paddingTop,
            paddingLeft = this.paddingLeft,
            paddingRight = this.paddingRight,
            paddingBottom = this.paddingBottom;
        var pads = { 'paddingTopLeft': new L.Point(paddingLeft, paddingTop), 'paddingBottomRight': new L.Point(paddingRight, paddingBottom) };
        if (bnds.length >= 2 || (bnds.length == 1 && (paddingTop || paddingLeft || paddingBottom || paddingRight)))
            this.map.fitBounds(new L.LatLngBounds(bnds), pads);
        else {
            if (bnds.length == 1) ctrl.map.setView(bnds[0]);
            if (minZoom = this.zoom)
                ctrl.map.setZoom(minZoom);
        }
    };
    private redrawMap() {
        var ctrl = this;
        if (ctrl.tiles)
            ctrl.tileLayer.setUrl(this.tiles);
    }
    private invalidateMapSize() {
        var ctrl = this;
        if (ctrl.map)
            ctrl.map.invalidateSize({});
    }
    private initialize() {
        var ctrl = this;
        var scale = ctrl['scale'];
        var draggable = ctrl['draggable'];

        var dblClickZoom = ctrl['doubleClickZoom'];

        var kbShortcuts = ctrl['keyboardShortcuts'];

        //
        var center: L.LatLng = L.latLng(utils.parseCoords(ctrl.center));
        var mapOptions = {

            zoomControl: scale && !ctrl.zoomControl,

            scrollWheelZoom: scale,

            dragging: draggable,

            doubleClickZoom: !dblClickZoom,
            keyboard: kbShortcuts
        };

        var container = this.canvas.nativeElement;
        var mapElement = document.createElement('div');
        mapElement.style.width = '100%';
        mapElement.style.height = '100%';
        container.appendChild(mapElement);
        var map = ctrl.map = L.map(<HTMLElement>mapElement, <L.Map.MapOptions>mapOptions);

        if (scale && ctrl.zoomControl)
            map.addControl(L.control.zoom({
                position: ctrl['zoomControl']
            }));

        map.on('moveend', () => ctrl.idleFiller());
        map.on('load', () => ctrl.idleFiller());

        ctrl.tileLayer = L.tileLayer(this.tiles,
            { attribution: this.attribution }).addTo(map);

        // setting now the center and zoom, triggers the "load" event and activates the child-components, if any.
        /*
        LeafletJS docs: Map's "load" Event
        "Fired when the map is initialized (when its center and zoom are set for the first time)."
        (http://leafletjs.com/reference.html#map-events)
        */
        map.setView(center, ctrl.zoom);

        /*map.on('idle', function (evt) {
            if ('radar' in $attrs) {
                var model = $scope[$attrs['radar']] = $scope[$attrs['radar']] || {};
                var cntr = map.getCenter();
                var zm = map.getZoom();
                var bnds = map.getBounds();
                var ne = bnds.getNorthEast();
                var sw = bnds.getSouthWest();
                var nw = bnds.getNorthWest();
                var se = bnds.getSouthEast();
                var current = {
                    'ne': ne, 'sw': sw, 'se': se, 'nw': nw, 'center': cntr, 'zoom': zm
                };
                if (!ng.equals(model, current))
                    $scope.$applyAsync(function () {
                        ng.extend(model, current);
                    });
            }
        });*/
        // first-load
        ctrl.map.once('idle', function () {

            ctrl.map.fire('resize');
            ctrl.mapLoaded.emit({});
        });

        // call setView NOW to trigger the load event :(
        map.setView(utils.parseCoords(this.center));

    }

    private idleTimeoutHandler: number = 0;
    private idleFiller() {
        var ctrl = this;
        clearTimeout(ctrl.idleTimeoutHandler);
        ctrl.idleTimeoutHandler = window.setTimeout(() => {
            if (ctrl.map)
                ctrl.map.fire('idle');
        }, 500);
    };
}
// #endregion

//#region MARKER
@Component({
    selector: consts.MARKER_SELECTOR,
    template: `<div class="pacem-map-marker-info" #content><ng-content></ng-content><div>`
})
export class PacemMapMarker {
    @Input() position: string | number[] = '';
    @Input() icon: string = null;
    @Input() size: string = null;
    @Input() anchor: string = null;
    @Input() popupAnchor: string = null;
    @Input() draggable: boolean = false;

    @Output('drag') ondrag = new EventEmitter();
    @Output('info') oninfo = new EventEmitter();
    @Output('close') onclose = new EventEmitter();

    @ViewChild('content') contentElement: ElementRef;

    private mapCmp: PacemMap = null;
    private marker: L.Marker = null;

    // methods/events
    private onDragEnd() {
        this.ondrag.emit({ position: this.marker.getLatLng() });
    }
    private onInfo() {
        this.oninfo.emit({});
    }
    private onClose() {
        this.onclose.emit({});
    }
    private isMapInitialized(): boolean {
        return !!(this.mapCmp && this.mapCmp.getMap());
    }
    private isMarkerInitialized(): boolean {
        return !!(this.isMapInitialized() && this.marker);
    }

    constructor(map: PacemMap) {
        this.mapCmp = map;
        this.mapCmp.mapLoaded.subscribe(() => this.ensureMarker());
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        this.ensureMarker();
    }

    ngOnDestroy() {
        if (this.isMapInitialized()) {
            this.mapCmp.mapLoaded.unsubscribe();
            //
            if (this.marker) {
                this.mapCmp.removeMarker(this.marker);
                this.mapCmp.getMap().removeLayer(this.marker);
            }
        }
        delete this.marker;
    }

    private ensureMarker() {
        var ctrl = this;
        if (!ctrl.isMapInitialized()) return;
        if (!ctrl.marker) {
            ctrl.marker = L.marker(
                utils.parseCoords(ctrl['position'])
            ).addTo(ctrl.mapCmp.getMap());
            ctrl.marker.on('click', () => ctrl.openInfoWindow());
            ctrl.marker.on('drag', () => ctrl.mapCmp.fitBounds());
            ctrl.marker.on('dragend', () => ctrl.onDragEnd());
            ctrl.mapCmp.addMarker(ctrl.marker);
        }
        ctrl.setPosition(ctrl['position']);
        ctrl.setIcon(ctrl['icon']);
        ctrl.setCaption();
        ctrl.setDraggable();
    }

    private openInfoWindow() {
        var ctrl = this;
        var domElement = <HTMLElement>ctrl.contentElement.nativeElement;
        if (!utils.isContentEmpty(domElement)) {
            ctrl.marker
                .bindPopup(domElement)
                .openPopup();

            ctrl.onInfo();

            ctrl.marker.on('popupclose', function () {
                ctrl.marker.unbindPopup();
                ctrl.onClose();
            });
        }
    }

    private setDraggable(v?: boolean) {
        if (!this.isMarkerInitialized()) return;

        if (v || this['draggable'])
            this.marker.dragging.enable();
        else
            this.marker.dragging.disable();
    }

    private setPosition(p: string | number[]) {
        if (!this.isMarkerInitialized()) return;
        var position = utils.parseCoords(p);
        this.marker.setLatLng(position);
        //
        this.mapCmp.fitBounds();
    }

    private setIcon(v: string | L.Icon) {
        if (!this.isMarkerInitialized()) return;
        var marker = this.marker;
        if (typeof v === 'string') {
            var icon = { 'iconUrl': v }, size, anchor, popup;
            if ((size = this['size']) && /[\d]+,[\d]+/.test(size)) {
                var ndx = -1;
                var size0 = [parseInt(size.substring(0, (ndx = size.indexOf(',')))), parseInt(size.substring(ndx + 1))];
                Object.assign(icon, { 'iconSize': size0 });
            }
            if ((anchor = this['anchor']) && /[\d]+,[\d]+/.test(anchor)) {
                var ndx = -1;
                var anchor0 = [parseInt(anchor.substring(0, (ndx = anchor.indexOf(',')))), parseInt(anchor.substring(ndx + 1))];
                Object.assign(icon, { 'iconAnchor': anchor0, 'popupAnchor': [0, -anchor0[1]] });
            }
            if ((popup = this['popupAnchor']) && /[\d]+,[\d]+/.test(popup)) {
                var ndx = -1;
                var anchor0 = [parseInt(anchor.substring(0, (ndx = anchor.indexOf(',')))), parseInt(anchor.substring(ndx + 1))];
                Object.assign(icon, { 'popupAnchor': anchor0 });
            }

            marker.setIcon(L.icon(icon));
        } else if (v) marker.setIcon(v);
    }

    private setCaption() {
        if (!this.isMarkerInitialized()) return;

        var marker = this.marker, content = this.contentElement.nativeElement;
        if (marker.getPopup() && marker.getPopup().getContent() != content)
            marker.setPopupContent(content);
    }

}
//#endregion

//#region CIRCLE
@Component({
    selector: consts.CIRCLE_SELECTOR,
    template: `<div class="pacem-map-circle-info" #content><ng-content></ng-content><div>`
})
export class PacemMapCircle {

    @Input() radius: number = 0;
    @Input() center: string | number[] = '';
    @Input() stroke: string = '';
    @Input() fill: string = '';
    @Input() thickness: number = 2;

    @Output('info') oninfo = new EventEmitter();
    @Output('close') onclose = new EventEmitter();

    @ViewChild('content') contentElement: ElementRef;

    private mapCmp: PacemMap = null;
    private circle: L.Circle = null;

    // methods/events
    private onInfo() {
        this.oninfo.emit({});
    }
    private onClose() {
        this.onclose.emit({});
    }
    private onClick(evt?) {
        var ctrl = this;
        var domElement = <HTMLElement>ctrl.contentElement.nativeElement
        if (!utils.isContentEmpty(domElement)) {
            ctrl.circle
                .bindPopup(domElement)
                .openPopup();

            ctrl.onInfo();

            ctrl.circle.on('popupclose', function () {
                ctrl.circle.unbindPopup();
                ctrl.onClose();
            });
        }
    }
    private isMapInitialized(): boolean {
        return !!(this.mapCmp && this.mapCmp.getMap());
    }
    private isCircleInitialized(): boolean {
        return !!(this.isMapInitialized() && this.circle);
    }

    constructor(map: PacemMap) {
        this.mapCmp = map;
        this.mapCmp.mapLoaded.subscribe(() => this.ensureCircle());
    }

    ngOnChanges(changes?) {
        this.ensureCircle();
    }

    ngOnDestroy() {
        if (this.isMapInitialized()) {
            this.mapCmp.mapLoaded.unsubscribe();
            //
            if (this.circle) {
                this.mapCmp.removeShape(this.circle);
                this.mapCmp.getMap().removeLayer(this.circle);
            }
        }
        delete this.circle;
    }

    private ensureCircle() {
        var ctrl = this;
        if (!ctrl.isMapInitialized()) return;
        if (!ctrl.circle) {
            var center = utils.parseCoords(ctrl['center']);
            var radius = ctrl['radius'] || .0;
            ctrl.circle = <L.Circle>L.circle(center, radius).addTo(ctrl.mapCmp.getMap());
            ctrl.mapCmp.addShape(ctrl.circle);
            ctrl.circle.on('click', () => ctrl.onClick());
        }

        ctrl.setLayout(ctrl['center'], ctrl['radius']);
        ctrl.setStroke(ctrl['stroke']);
        ctrl.setFill(ctrl['fill']);
        ctrl.setThickness(Math.floor(ctrl['thickness']));
    }

    private setLayout(c, r) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized()) return;
        var radius = parseFloat(r) || 0;
        ctrl.circle.setRadius(radius);
        var center = utils.parseCoords(c);
        ctrl.circle.setLatLng(center);
        ctrl.mapCmp.fitBounds();
    }

    private setFill(clr) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized()) return;
        ctrl.circle.setStyle({ 'fillColor': (clr || 'rgba(108,145,183,0.25)') });
    }

    private setStroke(clr) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized()) return;
        ctrl.circle.setStyle({ 'color': (clr || 'rgb(108,145,183)') });
    }

    private setThickness(th) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized()) return;
        ctrl.circle.setStyle({ 'weight': th || 3 });
    }
}
//#endregion

//#region POLYLINE
@Component({
    selector: consts.POLYLINE_SELECTOR,
    template: `<div class="pacem-map-polyline-info" #content><ng-content></ng-content><div>`
})
export class PacemMapPolyline {

    @Input() path: number[][] = [];
    @Input() stroke: string = '';
    @Input() thickness: number = 2;

    @Output('info') oninfo = new EventEmitter();
    @Output('close') onclose = new EventEmitter();

    @ViewChild('content') contentElement: ElementRef;

    private mapCmp: PacemMap = null;
    private polyline: L.Polyline = null;

    // methods/events
    private onInfo() {
        this.oninfo.emit({});
    }
    private onClose() {
        this.onclose.emit({});
    }
    private onClick(evt?) {
        var ctrl = this;
        var domElement = <HTMLElement>ctrl.contentElement.nativeElement
        if (!utils.isContentEmpty(domElement)) {
            ctrl.polyline
                .bindPopup(domElement)
                .openPopup();

            ctrl.onInfo();

            ctrl.polyline.on('popupclose', function () {
                ctrl.polyline.unbindPopup();
                ctrl.onClose();
            });
        }
    }
    private isMapInitialized(): boolean {
        return !!(this.mapCmp && this.mapCmp.getMap());
    }
    private isShapeInitialized(): boolean {
        return !!(this.isMapInitialized() && this.polyline);
    }

    constructor(map: PacemMap) {
        this.mapCmp = map;
        this.mapCmp.mapLoaded.subscribe(() => this.ensurePolyline());
    }

    ngOnChanges(changes?) {
        this.ensurePolyline();
    }

    ngOnDestroy() {
        if (this.isMapInitialized()) {
            this.mapCmp.mapLoaded.unsubscribe();
            //
            if (this.polyline) {
                this.mapCmp.removeShape(this.polyline);
                this.mapCmp.getMap().removeLayer(this.polyline);
            }
        }
        delete this.polyline;
    }

    private ensurePolyline() {
        var ctrl = this;
        if (!ctrl.isMapInitialized()) return;
        if (!ctrl.polyline) {
            var path = ctrl['path'];
            ctrl.polyline = <L.Polyline>L.polyline(path).addTo(ctrl.mapCmp.getMap());
            ctrl.mapCmp.addShape(ctrl.polyline);
            ctrl.polyline.on('click', () => ctrl.onClick());
        }

        ctrl.setLayout(ctrl['path']);
        ctrl.setStroke(ctrl['stroke']);
        ctrl.setThickness(Math.floor(ctrl['thickness']));
    }

    private setLayout(c: number[][]) {
        var ctrl = this;
        if (!ctrl.isShapeInitialized()) return;
        ctrl.polyline.setLatLngs(c);
        ctrl.mapCmp.fitBounds();
    }

    private setStroke(clr) {
        var ctrl = this;
        if (!ctrl.isShapeInitialized()) return;
        ctrl.polyline.setStyle({ 'color': (clr || 'rgb(108,145,183)') });
    }

    private setThickness(th) {
        var ctrl = this;
        if (!ctrl.isShapeInitialized()) return;
        ctrl.polyline.setStyle({ 'weight': th || 3 });
    }
}
//#endregion
