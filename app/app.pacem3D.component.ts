import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { PacemUtils } from './../pacem/pacem-core';
import { Pacem3D, Pacem3DCamera, Pacem3DLight, Pacem3DObject, ITrackedObj } from './../pacem/pacem-3d';

@Component({
    selector: 'app-pacem-3d',
    template: `<h2>Pacem 3D</h2>
<div #container (window:resize)="onResize($event)"><pacem-3d orbit="true" interactive="true" #canvas>
    <pacem-3d-object *ngFor="let obj of objects; let i=index" [url]="obj.url" [object]="obj.mesh" [position]="obj.position" [tag]="obj.tag" [format]="obj.format"
        (click)="onClick($event)"
        (over)="onOver($event)"
        (out)="onOut($event)"></pacem-3d-object>
    <pacem-3d-light position="25 12.5 50" intensity="1" color="#8fbbcc"></pacem-3d-light>
</pacem-3d></div>`/*, 
    entryComponents: [Pacem3D]*/
})
export class Pacem3DComponent implements AfterViewInit {

    private objects = [
        {
            'position': '-4.05 2 2.6',
            'tag': 'cube#1',
            'mesh': new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), new THREE.MeshNormalMaterial())
        },
        {
            'position': '0 0 0',
            'tag': '1st_floor',
            'format': 'JSON',
            'url': `barchessa.json` }
    ];
    private initialized: boolean = false;

    @ViewChild("canvas") pacem3D: Pacem3D;
    @ViewChild("container") container: ElementRef;
    

    ngAfterViewInit() {
        this.initialized = true;
        this.onResize();
    }

    private onResize(evt?: Event) {
        if (!this.initialized) return;
        var offset = PacemUtils.offset(this.container.nativeElement), win = window;
        var viewportHeight = win.innerHeight || win.document.documentElement.clientHeight || win.document.body.clientHeight || 0;
        this.pacem3D.resize('100%', viewportHeight - offset.top);
    }

    private onOver(obj: ITrackedObj) {
        console.log('over: ' + JSON.stringify({ id: obj.id, tag: obj.tag, mesh: obj.object instanceof THREE.Mesh }));
    }

    private onClick(obj: ITrackedObj) {
        console.log('click: ' + JSON.stringify({ id: obj.id, tag: obj.tag, mesh: obj.object instanceof THREE.Mesh }));
    }

    private onOut(obj: ITrackedObj) {
        console.log('out: ' + JSON.stringify({ id: obj.id, tag: obj.tag, mesh: obj.object instanceof THREE.Mesh }));
    }

}