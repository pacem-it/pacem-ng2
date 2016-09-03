import { AfterViewInit, ElementRef } from '@angular/core';
export declare class PacemMapComponent implements AfterViewInit {
    container: ElementRef;
    ngAfterViewInit(): void;
    private onResize(evt?);
    private initialized;
    hereSpot: string;
    hereInfluence: number;
    plungeSpot: number[];
    onDrag(evt: any): void;
    markers: {
        pos: number[];
        desc: string;
    }[];
    constructor();
    steps: number[][];
    spliceMarker(ndx: any): void;
    setupInfo(ndx: any): void;
    private refreshSteps();
}
