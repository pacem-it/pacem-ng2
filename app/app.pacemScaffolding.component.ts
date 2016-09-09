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
    <form>
    <pacem-field *ngFor="let item of meta" [field]="item" [entity]="entity"></pacem-field>
    <p>{{ entity | json }}</p>
    
<p>This is the readonly version synchronized with the form above:</p>

    <pacem-field *ngFor="let item of meta" readonly="true" [field]="item" [entity]="entity"></pacem-field>
    </form>

`,
    providers: [PacemLooper, PacemHttp]/*,
    entryComponents: [PacemField]*/
})
export class PacemScaffoldingComponent implements AfterViewInit {

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
        Name: 'Cristian', Resume: 'Your <b>CV</b> here...', Birthdate: '2015-07-08T09:58:00.000Z',
        FavFood: "ice cream", //FavFoods: [{ ID: 4 }]
    };

    //ngDoCheck() {
    //    if (this.entity.FavFoods instanceof Array)
    //        setTimeout(() => {
    //            if (JSON.stringify(this.entity.FavFoods) != JSON.stringify(this.entity['FavFoods2'] || [])) {
    //                this.entity['FavFoods2'] = this.entity.FavFoods.slice(0);
    //                this.ref.markForCheck();
    //            }
    //        });
    //}

}