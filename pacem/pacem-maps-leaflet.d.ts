import { EventEmitter, ElementRef, AfterContentInit, SimpleChange } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
export declare class PacemMapLink {
    private sanitizer;
    target: string | number[];
    private link;
    constructor(sanitizer: DomSanitizer);
    ngOnChanges(): void;
    private updateLink();
}
export declare class PacemMap implements AfterContentInit {
    zoom: number;
    center: string;
    tiles: string;
    attribution: string;
    scale: boolean;
    /**
    * zoom control position
    */
    zoomControl: "topleft" | "topright" | "bottomleft" | "bottomright";
    draggable: boolean;
    doubleClickZoom: boolean;
    keyboardShortcuts: boolean;
    paddingTop: number;
    paddingLeft: number;
    paddingRight: number;
    paddingBottom: number;
    mapLoaded: EventEmitter<{}>;
    canvas: ElementRef;
    constructor();
    private map;
    private markers;
    private tileLayer;
    private shapes;
    ngOnChanges(): void;
    ngAfterContentInit(): void;
    onResize(): void;
    private _throttler;
    private _resetThrottler();
    getMap(): L.Map;
    addMarker(marker: L.Marker): void;
    removeMarker(marker: L.Marker): void;
    addShape(shape: L.Path): void;
    removeShape(shape: L.Path): void;
    fitBounds(): void;
    private _fitBounds();
    private redrawMap();
    private invalidateMapSize();
    private initialize();
    private idleTimeoutHandler;
    private idleFiller();
}
export declare class PacemMapMarker {
    position: string | number[];
    icon: string;
    size: string;
    anchor: string;
    popupAnchor: string;
    draggable: boolean;
    ondrag: EventEmitter<{}>;
    oninfo: EventEmitter<{}>;
    onclose: EventEmitter<{}>;
    contentElement: ElementRef;
    private mapCmp;
    private marker;
    private onDragEnd();
    private onInfo();
    private onClose();
    private isMapInitialized();
    private isMarkerInitialized();
    constructor(map: PacemMap);
    ngOnChanges(changes: {
        [propertyName: string]: SimpleChange;
    }): void;
    ngOnDestroy(): void;
    private ensureMarker();
    private openInfoWindow();
    private setDraggable(v?);
    private setPosition(p);
    private setIcon(v);
    private setCaption();
}
export declare class PacemMapCircle {
    radius: number;
    center: string | number[];
    stroke: string;
    fill: string;
    thickness: number;
    oninfo: EventEmitter<{}>;
    onclose: EventEmitter<{}>;
    contentElement: ElementRef;
    private mapCmp;
    private circle;
    private onInfo();
    private onClose();
    private onClick(evt?);
    private isMapInitialized();
    private isCircleInitialized();
    constructor(map: PacemMap);
    ngOnChanges(changes?: any): void;
    ngOnDestroy(): void;
    private ensureCircle();
    private setLayout(c, r);
    private setFill(clr);
    private setStroke(clr);
    private setThickness(th);
}
export declare class PacemMapPolyline {
    path: number[][];
    stroke: string;
    thickness: number;
    oninfo: EventEmitter<{}>;
    onclose: EventEmitter<{}>;
    contentElement: ElementRef;
    private mapCmp;
    private polyline;
    private onInfo();
    private onClose();
    private onClick(evt?);
    private isMapInitialized();
    private isShapeInitialized();
    constructor(map: PacemMap);
    ngOnChanges(changes?: any): void;
    ngOnDestroy(): void;
    private ensurePolyline();
    private setLayout(c);
    private setStroke(clr);
    private setThickness(th);
}
export declare class PacemMapsLeafletModule {
}
