import { PacemLooper, PacemPromise } from './../pacem/pacem-core';
import { PacemHttp } from './../pacem/pacem-net';
import { NgForm } from '@angular/forms';
import { ChangeDetectorRef, AfterViewInit } from '@angular/core';
export declare class PacemScaffoldingComponent implements AfterViewInit {
    private ref;
    private looper;
    private http;
    private readonly;
    constructor(ref: ChangeDetectorRef, looper: PacemLooper, http: PacemHttp);
    check(form: NgForm): void;
    params: {
        culture: string;
    };
    foodsPromise: PacemPromise<{
        caption: string;
        value: any;
        entity: any;
    }[]>;
    ngAfterViewInit(): void;
    meta: any[];
    entity: {
        Name: string;
        Resume: string;
        Birthdate: string;
        Sex: number;
        FavFood: string;
    };
}
