import { PacemLooper } from './../pacem/pacem-core';
import { PacemHttp } from './../pacem/pacem-net';
import { ChangeDetectorRef, AfterViewInit } from '@angular/core';
export declare class PacemScaffoldingComponent implements AfterViewInit {
    private ref;
    private looper;
    private http;
    constructor(ref: ChangeDetectorRef, looper: PacemLooper, http: PacemHttp);
    ngAfterViewInit(): void;
    meta: any[];
    entity: {
        Name: string;
        Resume: string;
        Birthdate: string;
        FavFood: string;
    };
}
