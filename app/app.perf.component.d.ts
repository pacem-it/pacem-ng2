import { OnInit, OnDestroy } from '@angular/core';
export declare class PerfComponent implements OnInit, OnDestroy {
    constructor();
    items: any[];
    time: string;
    private _handle;
    ngOnInit(): void;
    ngOnDestroy(): void;
}
