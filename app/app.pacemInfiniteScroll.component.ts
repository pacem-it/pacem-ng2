import { Component } from '@angular/core';
import { PacemInfiniteScroll, PacemInViewport } from './../pacem/pacem-ui';

@Component({
    selector: 'app-pacem-infinite-scroll',
    template: `<h2 class="pacem-animatable">Pacem Infinite Scroll</h2>

<ol (pacemInfiniteScroll)="fetch($event)" [pacemInfiniteScrollEnabled]="items.length < 500 && enabled" pacemInfiniteScrollContainer="$document">
    <li *ngFor="let item of items">
        <div class="card" (pacemInViewport)="toggleVisibility(item, $event)">{{ item.label }} (visible: {{ !!item.visible }})</div></li>
</ol>
`,
    styles: [
        'ol > li { display: inline-block; font-size: 0; width: 25%; }',
        '.card { transition: opacity 1s; opacity: 0.25; font-size: 12px; color: #000; border: 1px solid #c0c0c0; background: #fff; padding: 48px 24px; }',
        '.card.pacem-in-viewport { opacity: 1 }'
    ]
})
export class PacemInfiniteScrollComponent {

    private items: { label: string, id: number }[] = [];
    private enabled: boolean = true;

    private fetch() {
        var amount = 20;
        for (var j = 0; j < amount; j++) {
            var ndx1 = this.items.length + 1;
            this.items.push({ id: ndx1, label: "Item " + ndx1.toString() });
        }
    }

    private toggleVisibility(i, evt) {
        i.visible = evt.visible;
    }
}