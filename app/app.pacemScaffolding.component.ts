import { PacemLooper, PacemPromise } from './../pacem/pacem-core';
import { PacemHttp } from './../pacem/pacem-net';
import { PacemField } from './../pacem/pacem-scaffolding';
import { JsonPipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { Component, DoCheck, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-pacem-scaffolding',
    template: `<h2 class="pacem-animatable">Pacem Scaffolding</h2>
<p class="pacem-animatable">Many input data types (and more to come) are involved in this self-composing form system.<br />
It includes styling, custom validation and fetching for complex data.</p>

<!--<form>
    <pacem-datetime-picker name="Birthdate" [(ngModel)]="entity.Birthdate"></pacem-datetime-picker>
</form>-->

    <button (click)="readonly=!readonly" class="pacem-btn">toggle readonly</button>

    <form #f="ngForm" novalidate (ngSubmit)="check(f)">
    <pacem-field    *ngFor="let item of meta" [field]="item" [entity]="entity" [readonly]="readonly"
                    [params]="params" 
                    [form]="f">
    </pacem-field>
    <p>{{ entity | json }}</p>
    
    <div [hidden]="readonly">
    <input type="submit" value="submit" class="pacem-btn primary" [disabled]="f.pristine || f.invalid" />

    <b>{{ ( f.valid ? 'valid': 'invalid' ) }}</b> and <b>{{ (f.pristine ?  'pristine' : 'dirty') }}</b></div>

    </form>

`,
    providers: [PacemLooper, PacemHttp]
})
export class PacemScaffoldingComponent implements AfterViewInit {

    private readonly = true;

    constructor(private ref: ChangeDetectorRef, private looper: PacemLooper, private http: PacemHttp) {
    }

    check(form:NgForm) {
        console.log(form.valid ? 'VALID' : 'INVALID');
    }

    get params() {
        return { culture: 'it' };
    }

    get foodsPromise(): PacemPromise<{ caption: string, value: any, entity: any }[]> {
        let deferred = PacemPromise.defer();
        this.http.get('foods.json').success(response => {
            let json = response.json;
            let array: string[] = json.result;
            deferred.resolve(array.map(food => { return { caption: food, value: food, entity: food }; }));
        });
        return deferred.promise;
    }

    ngAfterViewInit() {
        this.http.get('metadata.json')
            .success((response) => {
                const meta = response.json as any[];
                this.looper.loop(meta, (item) => {
                    if (item.prop === 'FavFood')
                        item.extra.fetch = this.foodsPromise;
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