import { PacemLooper } from './../pacem/pacem-core';
import { PacemHttp } from './../pacem/pacem-net';
import { PacemField } from './../pacem/pacem-scaffolding';
import { JsonPipe } from '@angular/common';
import { Component, DoCheck, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-pacem-scaffolding',
    template: `<h2>Pacem Scaffolding</h2>
<p>Many input data types (and more to come) are involved in this self-composing form system.<br />
It includes styling, custom validation and fetching for complex data.</p>

    <button (click)="readonly=!readonly">toggle readonly</button>

    <p></p>
    <form>
    <pacem-field *ngFor="let item of meta" [field]="item" [entity]="entity" [readonly]="readonly"></pacem-field>
    <p>{{ entity | json }}</p>
    

    </form>

`,
    providers: [PacemLooper, PacemHttp]
})
export class PacemScaffoldingComponent implements AfterViewInit {

    private readonly = true;

    constructor(private ref: ChangeDetectorRef, private looper: PacemLooper, private http: PacemHttp) {
    }

    ngAfterViewInit() {
        this.http.get('metadata.json')
            .success((responseText) => {
                const meta = JSON.parse(responseText) as any[];
                this.looper.loop(meta, (item) => {
                    this.meta.push(item);
                });
            });
    }

    meta = [];
    entity = {
        Name: 'Sebastian', Resume: 'Your <b>CV</b> here...', Birthdate: '2015-07-08T09:58:00.000Z', Sex: 0,
        FavFood: "ice cream", //FavFoods: [{ ID: 4 }]
    };

    

}