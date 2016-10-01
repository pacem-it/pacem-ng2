import { ElementRef, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
export declare class Detector3D {
    private detected;
    constructor();
    readonly info: {
        supported: boolean;
        info: {};
    };
}
export interface ITrackedObj {
    tag?: string;
    object?: THREE.Object3D;
    id: string;
}
export declare class Pacem3D implements OnChanges, OnInit {
    scene: THREE.Scene;
    /** @internal */
    camera: THREE.Camera;
    /** @internal */
    renderer: THREE.Renderer;
    private orbitsControl;
    private initialized;
    /** @internal */
    elementRef: ElementRef;
    interactive: boolean;
    orbit: boolean;
    onItemOut: EventEmitter<ITrackedObj>;
    onItemOver: EventEmitter<ITrackedObj>;
    onItemClick: EventEmitter<ITrackedObj>;
    onSceneUpdated: EventEmitter<{}>;
    onRender: EventEmitter<{
        scene: THREE.Scene;
    }>;
    onPreRender: EventEmitter<{
        cancel: boolean;
        scene: THREE.Scene;
    }>;
    /** @internal */ _dict: {
        [key: string]: Pacem3DObject;
    };
    resize(width: number | string, height: number | string): void;
    private scope;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    private onResize(evt);
    private resizeDelegate;
    private onMove(evt);
    private moveDelegate;
    private onClick(evt);
    private clickDelegate;
    private orbitControlsDelegate;
    private initOrbitControls();
    private disposeOrbitControls();
    /** @internal */
    setCamera(cam: THREE.Camera): void;
    private render();
    private init();
    private _firstRender;
    private animate();
}
export declare class Pacem3DObject implements OnInit, OnDestroy {
    private pacem3dCtrl;
    private elRef;
    tag: string;
    format: string;
    object: THREE.Object3D | string;
    url: string;
    position: THREE.Vector3 | string;
    onClick: EventEmitter<ITrackedObj>;
    onOver: EventEmitter<ITrackedObj>;
    onOut: EventEmitter<ITrackedObj>;
    private obj3D;
    static datasetKey: string;
    constructor(pacem3dCtrl: Pacem3D, elRef: ElementRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private init();
    readonly boundingSphere: THREE.Sphere;
    readonly boundingBox: THREE.Box3;
    private getPointCoords(point);
    readonly projectionBox: {
        offset: {
            left: number;
            top: number;
        };
        center: {
            x: number;
            y: number;
        };
        faces: {
            x: number;
            y: number;
        }[];
    };
}
export declare class Pacem3DCamera implements OnInit, OnDestroy, OnChanges {
    private pacem3dCtrl;
    constructor(pacem3dCtrl: Pacem3D);
    private camera;
    type: string;
    active: boolean;
    position: string | THREE.Vector3;
    target: string | THREE.Vector3;
    private lastW;
    private lastH;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnInit(): void;
    ngOnDestroy(): void;
    private destroyCamera();
    private checkCamera();
    private init();
}
export declare class Pacem3DLight implements OnInit, OnDestroy, OnChanges {
    private pacem3dCtrl;
    constructor(pacem3dCtrl: Pacem3D);
    position: string | THREE.Vector3;
    on: boolean;
    intensity: number;
    color: number;
    private _light;
    readonly light: THREE.Light;
    ngOnInit(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    private destroyLight();
    private checkLight();
    private init();
}
export declare class Pacem3DModule {
}
