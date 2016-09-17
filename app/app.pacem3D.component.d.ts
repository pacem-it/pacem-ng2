import { AfterViewInit, ElementRef } from '@angular/core';
import { Pacem3D } from './../pacem/pacem-3d';
import { PacemBindService } from './../pacem/pacem-ui';
export declare class Pacem3DComponent implements AfterViewInit {
    private bindings;
    private objects;
    private initialized;
    constructor(bindings: PacemBindService);
    pacem3D: Pacem3D;
    container: ElementRef;
    ngAfterViewInit(): void;
    private onResize(evt?);
    private onOver(obj);
    private onClick(obj);
    private onOut(obj);
}
