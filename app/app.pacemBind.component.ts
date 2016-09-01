import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PacemUtils } from './../pacem/pacem-core';
import { PacemBindTarget, PacemBindTargets } from './../pacem/pacem-ui';
import { Pacem3D, Pacem3DCamera, Pacem3DLight, Pacem3DObject, ITrackedObj } from './../pacem/pacem-3d';

@Component({
    selector: 'app-pacem-bind',
    template: `<h2>Pacem Bind</h2>
<div>

<div class="target" pacemBindTarget="target" #target="pacemBindTarget"></div>

<div class="target source" pacemBindTarget="targetAndSource" [pacemBindTargets]="[{key: 'target', from: 'bottom', to: 'top', css: 'fixed'}]"
     (mousedown)="startDrag($event)" (mousemove)="drag($event)" (mouseup)="drop($event)"></div>

<div class="source" [pacemBindTargets]="['target']" (mousedown)="startDrag($event)" (mousemove)="drag($event)" (mouseup)="drop($event)"></div>
<div class="source" [pacemBindTargets]="[{key: 'target3d', from: 'left', to: 'bottom', css: 'fixed'},
{key: 'targetAndSource', from: 'bottom', to: 'top', css: 'fixed'}]" (mousedown)="startDrag($event)" (mousemove)="drag($event)" (mouseup)="drop($event)"></div>


<pacem-3d orbit="true" (sceneupdated)="trigger.refresh()">
<pacem-3d-object pacemBindTarget="target3d" [object]="obj" position="0,.0,0"></pacem-3d-object>
</pacem-3d>


</div>`,
    styles: [
        '.target, .source{ position: absolute; width: 100px; height: 100px; }',
        '.target { top: 450px; left: 450px; background: #f00; }',
        '.source { top: 250px; left: 250px; background: #080; cursor: move; }',
        '.source.target { background: #fc0; top: 250px; left: 450px;  }',
        '.source:nth-child(2n) { top: 275px; left: 450px; }'
    ],
    directives: [Pacem3D, Pacem3DCamera, Pacem3DLight, Pacem3DObject, PacemBindTarget, PacemBindTargets]
})
export class PacemBindComponent {

    @ViewChild('target') trigger: PacemBindTarget;

    private startPoint: { x: number, y: number };
    private startPosition: { x: number, y: number };
    private handle: HTMLElement;

    private obj = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshNormalMaterial());

    private startDrag(evt: MouseEvent) {
        evt.stopPropagation();
        this.startPoint = { x: evt.pageX, y: evt.pageY };
        this.handle = <HTMLElement>(evt.srcElement || evt.target);
        let offset = PacemUtils.offset(this.handle);
        this.startPosition = { x: offset.left, y: offset.top };
    }

    private drag(evt: MouseEvent) {
        if (!this.startPoint) return;
        evt.preventDefault();
        evt.stopPropagation();
        this.handle.style.left = (this.startPosition.x - (this.startPoint.x - evt.pageX)) + 'px';
        this.handle.style.top = (this.startPosition.y - (this.startPoint.y - evt.pageY)) + 'px';
        //
        this.trigger.refresh();
    }

    private drop(evt: MouseEvent) {
        if (this.startPoint) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        this.startPoint = null;
    }

}