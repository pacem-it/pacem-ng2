/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
import { Component, Injectable, Directive, NgModule,
    ViewChild, ElementRef, Input, Output, EventEmitter,
    OnChanges, SimpleChange, SimpleChanges,
    AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { PacemUtils } from './pacem-core';
//import { OBJMTLLoader } from './three-objmtlloader';

@Injectable()
export class Detector3D {

    private detected = { supported: false, info: {} };

    constructor() {
        let cvs = document.createElement('canvas');
        let contextNames = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
        let ctx: WebGLRenderingContext;
        let getParam = function (str) {
            if (!str) return undefined;
            return ctx.getParameter(str);
        }
        // addLine
        let addLine = (section, name, value) => {
            let detected = this.detected;
            var info = detected.info[section] = detected.info[section] || {};
            name = name.replace(/[^\w]+/g, '');
            name = name.substring(0, 1).toLowerCase() + name.substring(1);
            info[name] = value;
        };

        if (navigator.userAgent.indexOf('MSIE') >= 0) {
            try {
                ctx = window['WebGLHelper'].CreateGLContext(cvs, 'canvas');
            } catch (e) { }
        }
        else {
            for (var i = 0; i < contextNames.length; i++) {
                try {
                    ctx = <WebGLRenderingContext>cvs.getContext(contextNames[i]);
                    if (ctx) {
                        addLine('main', 'Context Name', contextNames[i]);
                        break;
                    }
                } catch (e) { }
            }
        }

        this.detected.supported = !!ctx;

        addLine('main', 'Platform', navigator.platform);
        addLine('main', 'Agent', navigator.userAgent);

        if (ctx) {
            addLine('main', 'Vendor', getParam(ctx.VENDOR));
            addLine('main', 'Version', getParam(ctx.VERSION));
            addLine('main', 'Renderer', getParam(ctx.RENDERER));
            addLine('main', 'Shading Language Version', getParam(ctx.SHADING_LANGUAGE_VERSION));

            addLine('bits', 'Rgba Bits', getParam(ctx.RED_BITS) + ', ' + getParam(ctx.GREEN_BITS) + ', ' + getParam(ctx.BLUE_BITS) + ', ' + getParam(ctx.ALPHA_BITS));
            addLine('bits', 'Depth Bits', getParam(ctx.DEPTH_BITS));

            addLine('shader', 'Max Vertex Attribs', getParam(ctx.MAX_VERTEX_ATTRIBS));
            addLine('shader', 'Max Vertex Texture Image Units', getParam(ctx.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
            addLine('shader', 'Max Varying Vectors', getParam(ctx.MAX_VARYING_VECTORS));
            addLine('shader', 'Max Uniform Vectors', getParam(ctx.MAX_VERTEX_UNIFORM_VECTORS));

            addLine('tex', 'Max Combined Texture Image Units', getParam(ctx.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
            addLine('tex', 'Max Texture Size', getParam(ctx.MAX_TEXTURE_SIZE));
            addLine('tex', 'Max Cube Map Texture Size', getParam(ctx.MAX_CUBE_MAP_TEXTURE_SIZE));
            addLine('tex', 'Num. Compressed Texture Formats', getParam(ctx.COMPRESSED_TEXTURE_FORMATS));

            addLine('misc', 'Max Render Buffer Size', getParam(ctx.MAX_RENDERBUFFER_SIZE));
            addLine('misc', 'Max Viewport Dimensions', getParam(ctx.MAX_VIEWPORT_DIMS));
            addLine('misc', 'Aliased Line Width Range', getParam(ctx.ALIASED_LINE_WIDTH_RANGE));
            addLine('misc', 'Aliased Point Size Range', getParam(ctx.ALIASED_POINT_SIZE_RANGE));

            addLine('misc', 'Supported Extensions', ctx.getSupportedExtensions() || []);
        }
    }

    get info() {
        return this.detected;
    }
}

export interface ITrackedObj {
    tag?: string;
    object?: THREE.Object3D;
    id: string;
}

const three = THREE;

function parseVec3(input) {
    var matches = [], match;
    while ((match = /([\d.-]+)/.exec(input)) && (matches.length < 3)) {
        var toParse = match[1];
        input = input.substr(match.index + toParse.length);
        matches.push(parseFloat(toParse));
    }
    return matches;
}

@Component({
    selector: 'pacem-3d',
    template: `<canvas class="pacem-3d" #threeDCanvas></canvas>`,
    host: {
        '(mousemove)': 'onMove($event)',
        '(click)': 'onClick($event)',
        '(window:resize)': 'onResize($event)'
    }
})
export class Pacem3D implements OnChanges, OnInit {

    scene = new three.Scene();
    /** @internal */
    camera: THREE.Camera;
    /** @internal */
    renderer: THREE.Renderer;
    private orbitsControl: THREE.OrbitControls;
    private initialized: boolean = false;

    /** @internal */
    @ViewChild('threeDCanvas') elementRef: ElementRef;
    @Input() interactive: boolean = false;
    @Input() orbit: boolean = false;
    @Output('itemout') onItemOut = new EventEmitter<ITrackedObj>();
    @Output('itemover') onItemOver = new EventEmitter<ITrackedObj>();
    @Output('itemclick') onItemClick = new EventEmitter<ITrackedObj>();
    @Output('sceneupdated') onSceneUpdated = new EventEmitter();
    @Output('render') onRender = new EventEmitter<{ scene: THREE.Scene }>();
    @Output('prerender') onPreRender = new EventEmitter<{ cancel: boolean, scene: THREE.Scene }>();

    resize(width: number | string, height: number | string) {
        let w: string = typeof width === 'string' ? width : width + 'px';
        let h: string = typeof height === 'string' ? height : height + 'px';
        this.elementRef.nativeElement.style.width = w;
        this.elementRef.nativeElement.style.height = h;
        this.resizeDelegate();
    }

    private scope: {
        w: number, h: number, widthHalf: number, heightHalf: number, lastHover: ITrackedObj
    } = {
        w: 0, h: 0, widthHalf: 0, heightHalf: 0, lastHover: { id: '' }
    };

    ngOnInit() {
        this.init();
        this.initialized = true;
        this.animate();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['orbit'] && this.initialized)
            this.orbit ? this.initOrbitControls() : this.disposeOrbitControls();
    }

    //#region HANDLERS

    private onResize(evt: Event) {
        this.resizeDelegate(evt);
    }
    private resizeDelegate = (evt?: Event) => {
        let element = <HTMLCanvasElement>this.elementRef.nativeElement;
        let w = this.scope.w = element.clientWidth * 1.0;
        let h = this.scope.h = element.clientHeight * 1.0;
        let camera = this.camera as THREE.PerspectiveCamera;
        if (camera) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        if (this.renderer) this.renderer.setSize(w, h);
        this.scope.widthHalf = w * .5;
        this.scope.heightHalf = h * .5;
    }

    private onMove(evt) {
        this.moveDelegate(evt);
    }
    private moveDelegate = (e: PointerEvent) => {

        let me = this;
        if (!me.scene || !me.interactive) return;

        function getPointerObject(evt: PointerEvent) {
            let containerEl = <HTMLElement>evt.target, camera = me.camera;
            let offs = PacemUtils.offset(containerEl);
            let sEvent = evt;//<PointerEvent>event;
            let vector = new three.Vector2(
                ((sEvent.clientX - offs.left) / containerEl.clientWidth) * 2 - 1,
                -((sEvent.clientY - offs.top) / containerEl.clientHeight) * 2 + 1);

            let raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(vector, camera);

            let intersects = raycaster.intersectObjects(me.scene.children);
            let obj: THREE.Object3D;
            if (intersects.length > 0 && (obj = intersects[0].object)) {
                return <ITrackedObj>{ id: obj.uuid, object: obj, tag: obj.userData };
            }
            return <ITrackedObj>{ id: '' };
        }

        // what's really needed:
        let obj = getPointerObject(e);
        if (obj.id != me.scope.lastHover.id) {
            if (me.scope.lastHover.id) me.onItemOut.emit(me.scope.lastHover);
            if (obj.id) me.onItemOver.emit(obj);
            me.scope.lastHover = obj;
        }
    }

    private onClick(evt) {
        this.clickDelegate(evt);
    }
    private clickDelegate = (event: PointerEvent) => {
        event.preventDefault();
        if (this.scope.lastHover) this.onItemClick.emit(this.scope.lastHover);
    }

    //#endregion

    private orbitControlsDelegate = (evt?: any) => {
        //Ctrl.render();
        this.onSceneUpdated.emit({});
    }
    private initOrbitControls() {
        var controls = this.orbitsControl = new three.OrbitControls(this.camera, this.elementRef.nativeElement);
        controls.addEventListener('change', this.orbitControlsDelegate);
    }
    private disposeOrbitControls() {
        if (!this.orbitsControl) return;
        this.orbitsControl.removeEventListener('change', this.orbitControlsDelegate);
        this.orbitsControl.dispose();
    }
    /** @internal */
    setCamera(cam: THREE.Camera) {
        this.camera = cam;
        this.resizeDelegate();
        this.disposeOrbitControls();
        // re-init
        if (this.orbit) this.initOrbitControls();
    }

    //#region RENDERING

    private render() {
        this.renderer.render(this.scene, this.camera);
    }
    private init() {
        var canvas = <HTMLCanvasElement>this.elementRef.nativeElement;
        this.resizeDelegate();

        let w = this.scope.w,
            h = this.scope.h;
        if (!this.camera) {

            let camera = new three.PerspectiveCamera(75, (w / h), 0.1, 1000);
            camera.position.y = 2; camera.position.z = 2;// = new three.Vector3(0, 2, 2);
            camera.lookAt(new three.Vector3(0, 0, 0));
            this.setCamera(camera);
        }

        //if (!ctrl.renderer)
        let parameters: THREE.WebGLRendererParameters = {
            canvas: canvas, antialias: true, stencil: false, alpha: true, clearAlpha: 1
        };
        this.renderer = new three.WebGLRenderer(parameters);
        this.renderer.setSize(w, h);
        //renderer.setClearColor(attrs['backcolor'] || 0x00000000, 1);

    }

    private animate() {
        let cancelable = { cancel: false, scene: this.scene };
        this.onPreRender.emit(cancelable);
        if (!cancelable.cancel) {
            this.render();
            this.onRender.emit({ scene: this.scene });
            window.requestAnimationFrame(() => this.animate());
        }

        //#endregion

    }
}

@Directive({
    selector: 'pacem-3d-object'
})
export class Pacem3DObject implements OnInit, OnDestroy {

    @Input() tag: string;
    @Input() format: string;
    @Input() object: THREE.Object3D | string;
    @Input() url: string;
    @Input() position: THREE.Vector3 | string;
    @Output('click') onClick = new EventEmitter<ITrackedObj>();
    @Output('over') onOver = new EventEmitter<ITrackedObj>();
    @Output('out') onOut = new EventEmitter<ITrackedObj>();
    private obj3D: THREE.Object3D;

    static datasetKey: string = 'pacem3dObject';

    constructor(private pacem3dCtrl: Pacem3D, private elRef: ElementRef) {
    }

    ngOnInit() {
        this.init();
    }

    ngOnDestroy() {
        if (this.obj3D)
            this.pacem3dCtrl.scene.remove(this.obj3D);
    }

    private init() {
        let me = this;
        me.elRef.nativeElement[Pacem3DObject.datasetKey] = me;
        let scene = me.pacem3dCtrl.scene;

        function addToScene(obj: THREE.Object3D) {
            me.obj3D = obj;
            obj.userData = me.tag;
            scene.add(obj);
        }

        let format = (me['format'] || 'native').toLowerCase();

        let object = me['object'];
        let position = me['position'];

        function then(object3D: THREE.Object3D) {

            if (object3D) {
                let pos = position;// || new three.Vector3(0, 0, 0);
                if (typeof pos === 'string') {
                    var matches = parseVec3(pos);
                    pos = new three.Vector3(matches[0] || 0, matches[1] || 0, matches[2] || 0);
                }
                let posv = pos as THREE.Vector3;
                if (posv) {
                    object3D.position.x = posv.x; object3D.position.y = posv.y; object3D.position.z = posv.z;
                }
                addToScene(object3D);
            }
        }

        switch (format) {
            case 'json':
                let loader = new THREE.JSONLoader();
                if (me.url)
                    loader.load(me.url, (g, m) => {

                        then(new THREE.Mesh(g, (m && m.length && m[0]) || new THREE.MeshLambertMaterial()));

                    });
                else {
                    let tuple = loader.parse(me.object),
                        m = tuple.materials;
                    then(new THREE.Mesh(tuple.geometry, (m && m.length && m[0]) || new THREE.MeshLambertMaterial()));
                }
                break;
            // #region OBJ (deprecated, export JSON for three)
            /*case 'obj':
                (function () {

                    var loader = new OBJMTLLoader();
                    then(loader.parse(object));

                })();
                break;*/

            // #endregion

            // #region NATIVE

            case 'native':

                then(<THREE.Object3D>object);
                break;

            // #endregion
        }
    }

    get boundingSphere() {
        if (!(this.obj3D instanceof THREE.Mesh)) return null;
        let mesh = <THREE.Mesh>this.obj3D;
        if (!mesh.geometry.boundingSphere) {
            mesh.geometry.computeBoundingSphere();
        }
        return mesh.geometry.boundingSphere;
    }

    private getPointCoords(point: THREE.Vector3) {
        let renderer = this.pacem3dCtrl.renderer;
        var widthHalf = 0.5 * renderer.domElement.width;
        var heightHalf = 0.5 * renderer.domElement.height;
        let vector = point.clone();
        vector.project(this.pacem3dCtrl.camera);
        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = - (vector.y * heightHalf) + heightHalf;

        return {
            x: vector.x,
            y: vector.y
        };
    }


    get projectionCircle() {
        let sphere = this.boundingSphere;
        let center = this.obj3D.position.clone();
        let canvas: HTMLCanvasElement = this.pacem3dCtrl.elementRef.nativeElement;
        let offset = PacemUtils.offset(canvas);
        let camera = this.pacem3dCtrl.camera;

        let pos = this.getPointCoords(center);

        let orthodir = center.clone().sub(camera.position).cross(camera.up).normalize().multiplyScalar(sphere.radius);
        let edge = this.getPointCoords(orthodir.sub(center));
        let radius = PacemUtils.distance(pos, edge);// Math.sqrt(Math.pow(pos.x - edge.x, 2) + Math.pow(pos.y - edge.y, 2));

        return {
            center: {
                left: offset.left + pos.x,
                top: offset.top + pos.y,
            }, radius: radius
        };
    }

}

@Directive({
    selector: 'pacem-3d-camera'
})
export class Pacem3DCamera implements OnInit, OnDestroy, OnChanges {

    constructor(private pacem3dCtrl: Pacem3D) {
    }

    private camera: THREE.Camera;
    @Input() type: string = 'perspective';
    @Input() active: boolean = false;
    @Input() position: string | THREE.Vector3 = new THREE.Vector3();
    @Input() target: string | THREE.Vector3 = new THREE.Vector3();
    private lastW: number;
    private lastH: number;

    ngOnChanges(changes: SimpleChanges) {
        if (!this.camera) return;

        if (changes['type'])
            this.init();

        this.checkCamera();
    }

    ngOnInit() {
        this.init();
        this.checkCamera();
    }

    ngOnDestroy() {
        this.destroyCamera();
    }

    private destroyCamera() {
        if (!this.camera) return;
        this.pacem3dCtrl.scene.remove(this.camera);
        this.camera = null;
    }

    private checkCamera() {
        if (this.camera && this.active) {
            this.pacem3dCtrl.setCamera(this.camera);
            //
            let renderer = this.pacem3dCtrl.renderer;
            if (!renderer) return;
            let camera = this.camera,
                canvas = renderer.domElement, w = canvas.clientWidth, h = canvas.clientHeight,
                ortho = camera as THREE.OrthographicCamera,
                perspective = camera as THREE.PerspectiveCamera;

            if (this.lastW != w || this.lastH != h) {
                this.lastW = w; this.lastH = h;
                if (ortho) {
                    ortho.left = -.5 * w;
                    ortho.right = .5 * w;
                    ortho.top = .5 * h;
                    ortho.bottom = -.5 * h;
                } else {
                    // do nothing
                    //perspective.aspectRatio = (Math.round(100 * w / h) * .01) || perspective.aspectRatio;
                }
            }
            let p = new three.Vector3(), t = new three.Vector3();
            function merge(vec: THREE.Vector3, v: string | THREE.Vector3) {
                let p: THREE.Vector3;
                if (typeof v === 'string') {
                    var matches = parseVec3(v || '0,0,0');
                    p = new THREE.Vector3(matches[0] || 0, vec.y = matches[1] || 0, vec.z = -matches[2] || 0);
                } else if (v != null) {
                    let p = <THREE.Vector3>v;
                    vec.x = p.x;
                }
                if (p) {
                    vec.x = p.x; vec.y = p.y; vec.z = p.z;
                }
            }
            merge(p, this.position);
            merge(t, this.target);

            camera.position.x = p.x; camera.position.y = p.y; camera.position.z = p.z;
            camera.lookAt(t);

            if (perspective)
                perspective.updateProjectionMatrix();
        }
    }

    private init() {
        this.destroyCamera();
        let scope = this, scene = scope.pacem3dCtrl.scene;

        let perspective: THREE.PerspectiveCamera, ortho: THREE.OrthographicCamera;
        var lastW, lastH;
        switch ((scope.type || 'perspective').toLowerCase()) {
            case 'ortho':
            case 'orthographic':
                ortho = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
                break;
            default: // perspective
                perspective = new three.PerspectiveCamera(45, 1.78, 0.1, 1000);
                break;
        }
        this.camera = ortho || perspective;
    }

}

@Directive({
    selector: 'pacem-3d-light'
})
export class Pacem3DLight implements OnInit, OnDestroy, OnChanges {

    constructor(private pacem3dCtrl: Pacem3D) { }

    @Input() position: string | THREE.Vector3 = new THREE.Vector3();
    @Input() on: boolean = true;
    @Input() intensity: number = .25;
    @Input() color: number = 0xfff;

    private _light: THREE.Light;
    get light() {
        return this._light;
    }

    ngOnInit() {
        this.init();
        this.checkLight();
    }

    ngOnChanges() {
        if (!this.light) return;
        this.checkLight();
    }

    ngOnDestroy() {
        this.destroyLight();
    }

    private destroyLight() {
        if (!this._light) return;
        this.pacem3dCtrl.scene.remove(this._light);
        this._light = null;
    }

    private checkLight() {
        let scope = this, light = scope._light as THREE.SpotLight;
        var matches = parseVec3(scope.position);
        var x = matches[0], y = matches[1], z = -matches[2];
        //
        light.position.set(x, y, z);
        light.target.position.set(x, 0, z);
        light.color = new THREE.Color(scope.color);
        light.visible = scope.on;
        light.intensity = scope.intensity;

    }

    private init() {
        this.destroyLight();
        var scope = this,
            scene = this.pacem3dCtrl.scene;

        var light = this._light = new three.SpotLight();
        light.castShadow = true;
        light.shadow.mapSize.width = 1;
        light.shadow.mapSize.height = 1;
        scene.add(light);

        var manageLight = function () {
        }

    }

}

@NgModule({
    declarations: [ Pacem3D, Pacem3DCamera, Pacem3DLight, Pacem3DObject],
    exports: [Pacem3D, Pacem3DCamera, Pacem3DLight, Pacem3DObject]
})
export class Pacem3DModule { }