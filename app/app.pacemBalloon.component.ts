import { Component, Input, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PacemBalloon } from './../pacem/pacem-ui';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-pacem-balloon',
    template: `<h2>Pacem Balloon</h2>

<div class="pacem-field">
<input type="radio" [(ngModel)]="model.trigger" name="trig" id="trigHover" value="hover" /><label for="trigHover">hover</label>
<input type="radio" [(ngModel)]="model.trigger" name="trig" id="trigClick" value="click" /><label for="trigClick">click</label>
</div>
<div class="pacem-field">
<input type="radio" [(ngModel)]="model.behavior" name="beh" id="behMenu" value="menu" /><label for="behMenu">menu-like</label>
<input type="radio" [(ngModel)]="model.behavior" name="beh" id="behTip" value="tooltip" /><label for="behTip">tooltip</label>
</div>
<div class="pacem-field">
<input type="radio" [(ngModel)]="balloonName" name="b" id="b1" value="balloon1" /><label for="b1">balloon 1</label>
<input type="radio" [(ngModel)]="balloonName" name="b" id="b2" value="balloon2" /><label for="b2">balloon 2</label>
</div>
<div class="pacem-field">
<input type="radio" [(ngModel)]="model.position" name="pos" id="posTop" value="top" /><label for="posTop">top</label>
<input type="radio" [(ngModel)]="model.position" name="pos" id="posLeft" value="left" /><label for="posLeft">left</label>
<input type="radio" [(ngModel)]="model.position" name="pos" id="posBottom" value="bottom" /><label for="posBottom">bottom</label>
<input type="radio" [(ngModel)]="model.position" name="pos" id="posRight" value="right" /><label for="posRight">right</label>
<input type="radio" [(ngModel)]="model.position" name="pos" id="posAuto" value="auto" /><label for="posAuto">auto</label>
</div>

<span [pacemBalloon]="balloon" [pacemBalloonOptions]="model"><u>{{ model.trigger == 'hover'? 'MouseOver' : 'Click' }} here</u> for balloon</span>
<br />
<span pacemBalloon="#balloon1" [pacemBalloonOptions]="model"><u>{{ model.trigger == 'hover'? 'MouseOver' : 'Click' }} here</u> for balloon 1</span>

<div id="balloon1" #balloon1 hidden>
    This is the <b>1st</b> {{ model.position }}-positioned balloon!
</div>
<div id="balloon2" #balloon2 hidden>
    This is the <b>2nd</b> {{ model.position }}-positioned balloon!
</div>
`
})
export class PacemBalloonComponent implements OnInit {

    @ViewChild('balloon1') balloon1: ElementRef;
    @ViewChild('balloon2') balloon2: ElementRef;

    ngOnInit() {
        this.balloonName = 'balloon1';
    }

    private get balloonName() {
        return this.balloon.id;
    }
    private set balloonName(v: string) {
        this.balloon = this[v || 'balloon1'].nativeElement;
    }

    balloon: HTMLElement;
    model = { position: 'top', trigger: 'hover', behavior: 'menu' };
}