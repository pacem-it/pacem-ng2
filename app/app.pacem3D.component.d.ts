import { AfterViewInit, ElementRef } from '@angular/core';
import { Pacem3D } from './../pacem/pacem-3d';
export declare class Pacem3DComponent implements AfterViewInit {
    private objects;
    private initialized;
    pacem3D: Pacem3D;
    container: ElementRef;
    ngAfterViewInit(): void;
    private onResize(evt?);
    private onOver(obj);
    private onClick(obj);
    private onOut(obj);
}
