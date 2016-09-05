import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PacemHub, PacemHttp } from './../pacem/pacem-net';
export declare class PacemNetComponent implements OnInit, OnDestroy {
    private hub;
    private http;
    list: ElementRef;
    private counter;
    private meta;
    private entity;
    constructor(hub: PacemHub, http: PacemHttp);
    ngOnInit(): void;
    ngOnDestroy(): void;
    send(evt: Event): void;
}
