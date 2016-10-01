import { Component, ViewChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PacemHub, PacemHttp } from './../pacem/pacem-net';

@Component({
    selector: 'app-pacem-net',
    template: `<h2 class="pacem-animatable">Pacem Networking</h2><ul #echo>
</ul>

<p class="pacem-animatable"><b>{{ counter }}</b> message{{ counter == 1 ? ' has' : 's have' }} already been sent.</p>

<pacem-field *ngFor="let item of meta" [field]="item" [entity]="entity"></pacem-field>

<button (click)="send($event)" [disabled]="!entity.message" class="pacem-btn primary">Boomerang!</button>`
})
export class PacemNetComponent implements OnInit, OnDestroy {

    @ViewChild('echo') list: ElementRef;

    private counter: number = 0;
    private meta: any[] = [];
    private entity: { message?: string } = {};

    constructor(private hub: PacemHub, private http: PacemHttp) {
    }

    ngOnInit() {
        let hub = this.hub;
        hub.name = 'pacemNg2Hub';
        hub.url = '/signalr';
        hub.on('notify', (counter) => {
            this.counter = counter;
        });
        hub.start();
        //
        this.http.get('metadata-net.json')
            .success((response) => {
                const meta = response.json as any[];
                this.meta = meta;
            });
    }

    ngOnDestroy() {
        this.hub.stop();
    }

    send(evt: Event) {
        evt.preventDefault();
        //
        let ul = <HTMLUListElement>this.list.nativeElement;
        this.hub.invoke('echo', this.entity.message)
            .then((ret: string) => {
                let li = document.createElement('li');
                li.innerText = ret + ' (from SignalR)';
                ul.appendChild(li);
            }, (err) => {
                let li = <HTMLLIElement>document.createElement('li');
                li.style.color = 'red';
                li.innerText = err;
                ul.appendChild(li);
            });
        this.entity.message = '';
    }

}