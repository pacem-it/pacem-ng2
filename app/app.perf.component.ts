import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'pacem-perf',
    template: `<h2 class="pacem-animatable">Performance Test</h2>
<p class="pacem-animatable">This is a to-be-removed page, meant only to watch performances compared to PacemJS framework.</p>
<span *ngFor="let i of items">{{ time }}</span>
`,
})
export class PerfComponent implements OnInit, OnDestroy {

    constructor() {
        var arr = [];
        for (var j = 0; j < 1000; j++)
            arr.push('');
        this.items = arr;
    }

    items = [];
    time: string;

    private _handle: number;
    ngOnInit() {
        this._handle = window.setInterval(() => {
            this.time = new Date().toISOString();
        }, 20);
    }

    ngOnDestroy() {
        window.clearInterval(this._handle);
    }
}