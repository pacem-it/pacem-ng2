"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/// <reference path="../scripts/typings/threejs/three.d.ts" />
/// <reference path="../scripts/typings/threejs/three-projector.d.ts" />
/// <reference path="../scripts/typings/threejs/three-orbitcontrols.d.ts" />
/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
var core_1 = require('@angular/core');
var pacem_core_1 = require('./pacem-core');
var three_objmtlloader_1 = require('./three-objmtlloader');
var Detector3D = (function () {
    function Detector3D() {
        var _this = this;
        this.detected = { supported: false, info: {} };
        var cvs = document.createElement('canvas');
        var contextNames = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
        var ctx;
        var getParam = function (str) {
            if (!str)
                return undefined;
            return ctx.getParameter(str);
        };
        // addLine
        var addLine = function (section, name, value) {
            var detected = _this.detected;
            var info = detected.info[section] = detected.info[section] || {};
            name = name.replace(/[^\w]+/g, '');
            name = name.substring(0, 1).toLowerCase() + name.substring(1);
            info[name] = value;
        };
        if (navigator.userAgent.indexOf('MSIE') >= 0) {
            try {
                ctx = window['WebGLHelper'].CreateGLContext(cvs, 'canvas');
            }
            catch (e) { }
        }
        else {
            for (var i = 0; i < contextNames.length; i++) {
                try {
                    ctx = cvs.getContext(contextNames[i]);
                    if (ctx) {
                        addLine('main', 'Context Name', contextNames[i]);
                        break;
                    }
                }
                catch (e) { }
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
    Object.defineProperty(Detector3D.prototype, "info", {
        get: function () {
            return this.detected;
        },
        enumerable: true,
        configurable: true
    });
    Detector3D = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], Detector3D);
    return Detector3D;
}());
exports.Detector3D = Detector3D;
var three = THREE;
function parseVec3(input) {
    var matches = [], match;
    while ((match = /([\d.-]+)/.exec(input)) && (matches.length < 3)) {
        var toParse = match[1];
        input = input.substr(match.index + toParse.length);
        matches.push(parseFloat(toParse));
    }
    return matches;
}
var Pacem3D = (function () {
    function Pacem3D() {
        var _this = this;
        this.scene = new three.Scene();
        this.initialized = false;
        this.interactive = false;
        this.orbit = false;
        this.onItemOut = new core_1.EventEmitter();
        this.onItemOver = new core_1.EventEmitter();
        this.onItemClick = new core_1.EventEmitter();
        this.onSceneUpdated = new core_1.EventEmitter();
        this.onRender = new core_1.EventEmitter();
        this.onPreRender = new core_1.EventEmitter();
        this.scope = {
            w: 0, h: 0, widthHalf: 0, heightHalf: 0, lastHover: { id: '' }
        };
        this.resizeDelegate = function (evt) {
            var element = _this.elementRef.nativeElement;
            var w = _this.scope.w = element.clientWidth * 1.0;
            var h = _this.scope.h = element.clientHeight * 1.0;
            var camera = _this.camera;
            if (camera) {
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            }
            if (_this.renderer)
                _this.renderer.setSize(w, h);
            _this.scope.widthHalf = w * .5;
            _this.scope.heightHalf = h * .5;
        };
        this.moveDelegate = function (e) {
            var me = _this;
            if (!me.scene || !me.interactive)
                return;
            function getPointerObject(evt) {
                var containerEl = evt.target, camera = me.camera;
                var offs = pacem_core_1.PacemUtils.offset(containerEl);
                var sEvent = evt; //<PointerEvent>event;
                var vector = new three.Vector2(((sEvent.clientX - offs.left) / containerEl.clientWidth) * 2 - 1, -((sEvent.clientY - offs.top) / containerEl.clientHeight) * 2 + 1);
                var raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(vector, camera);
                var intersects = raycaster.intersectObjects(me.scene.children);
                var obj;
                if (intersects.length > 0 && (obj = intersects[0].object)) {
                    return { id: obj.uuid, object: obj, tag: obj.userData };
                }
                return { id: '' };
            }
            // what's really needed:
            var obj = getPointerObject(e);
            if (obj.id != me.scope.lastHover.id) {
                if (me.scope.lastHover.id)
                    me.onItemOut.emit(me.scope.lastHover);
                if (obj.id)
                    me.onItemOver.emit(obj);
                me.scope.lastHover = obj;
            }
        };
        this.clickDelegate = function (event) {
            event.preventDefault();
            if (_this.scope.lastHover)
                _this.onItemClick.emit(_this.scope.lastHover);
        };
        //#endregion
        this.orbitControlsDelegate = function (evt) {
            //Ctrl.render();
            _this.onSceneUpdated.emit({});
        };
    }
    Pacem3D.prototype.resize = function (width, height) {
        var w = typeof width === 'string' ? width : width + 'px';
        var h = typeof height === 'string' ? height : height + 'px';
        this.elementRef.nativeElement.style.width = w;
        this.elementRef.nativeElement.style.height = h;
        this.resizeDelegate();
    };
    Pacem3D.prototype.ngOnInit = function () {
        this.init();
        this.initialized = true;
        this.animate();
    };
    Pacem3D.prototype.ngOnChanges = function (changes) {
        if (changes['orbit'] && this.initialized)
            this.orbit ? this.initOrbitControls() : this.disposeOrbitControls();
    };
    //#region HANDLERS
    Pacem3D.prototype.onResize = function (evt) {
        this.resizeDelegate(evt);
    };
    Pacem3D.prototype.onMove = function (evt) {
        this.moveDelegate(evt);
    };
    Pacem3D.prototype.onClick = function (evt) {
        this.clickDelegate(evt);
    };
    Pacem3D.prototype.initOrbitControls = function () {
        var controls = this.orbitsControl = new three.OrbitControls(this.camera, this.elementRef.nativeElement);
        controls.addEventListener('change', this.orbitControlsDelegate);
    };
    Pacem3D.prototype.disposeOrbitControls = function () {
        if (!this.orbitsControl)
            return;
        this.orbitsControl.removeEventListener('change', this.orbitControlsDelegate);
        this.orbitsControl.dispose();
    };
    /** @internal */
    Pacem3D.prototype.setCamera = function (cam) {
        this.camera = cam;
        this.resizeDelegate();
        this.disposeOrbitControls();
        // re-init
        if (this.orbit)
            this.initOrbitControls();
    };
    //#region RENDERING
    Pacem3D.prototype.render = function () {
        this.renderer.render(this.scene, this.camera);
    };
    Pacem3D.prototype.init = function () {
        var canvas = this.elementRef.nativeElement;
        this.resizeDelegate();
        var w = this.scope.w, h = this.scope.h;
        if (!this.camera) {
            var camera = new three.PerspectiveCamera(75, (w / h), 0.1, 1000);
            camera.position.y = 2;
            camera.position.z = 2; // = new three.Vector3(0, 2, 2);
            camera.lookAt(new three.Vector3(0, 0, 0));
            this.setCamera(camera);
        }
        //if (!ctrl.renderer)
        var parameters = {
            canvas: canvas, antialias: true, stencil: false, alpha: true, clearAlpha: 1
        };
        this.renderer = new three.WebGLRenderer(parameters);
        this.renderer.setSize(w, h);
        //renderer.setClearColor(attrs['backcolor'] || 0x00000000, 1);
    };
    Pacem3D.prototype.animate = function () {
        var _this = this;
        var cancelable = { cancel: false, scene: this.scene };
        this.onPreRender.emit(cancelable);
        if (!cancelable.cancel) {
            this.render();
            this.onRender.emit({ scene: this.scene });
            window.requestAnimationFrame(function () { return _this.animate(); });
        }
        //#endregion
    };
    __decorate([
        core_1.ViewChild('threeDCanvas'), 
        __metadata('design:type', core_1.ElementRef)
    ], Pacem3D.prototype, "elementRef", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], Pacem3D.prototype, "interactive", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], Pacem3D.prototype, "orbit", void 0);
    __decorate([
        core_1.Output('itemout'), 
        __metadata('design:type', Object)
    ], Pacem3D.prototype, "onItemOut", void 0);
    __decorate([
        core_1.Output('itemover'), 
        __metadata('design:type', Object)
    ], Pacem3D.prototype, "onItemOver", void 0);
    __decorate([
        core_1.Output('itemclick'), 
        __metadata('design:type', Object)
    ], Pacem3D.prototype, "onItemClick", void 0);
    __decorate([
        core_1.Output('sceneupdated'), 
        __metadata('design:type', Object)
    ], Pacem3D.prototype, "onSceneUpdated", void 0);
    __decorate([
        core_1.Output('render'), 
        __metadata('design:type', Object)
    ], Pacem3D.prototype, "onRender", void 0);
    __decorate([
        core_1.Output('prerender'), 
        __metadata('design:type', Object)
    ], Pacem3D.prototype, "onPreRender", void 0);
    Pacem3D = __decorate([
        core_1.Component({
            selector: 'pacem-3d',
            template: "<canvas class=\"pacem-3d\" #threeDCanvas></canvas>",
            host: {
                '(mousemove)': 'onMove($event)',
                '(click)': 'onClick($event)',
                '(window:resize)': 'onResize($event)'
            }
        }), 
        __metadata('design:paramtypes', [])
    ], Pacem3D);
    return Pacem3D;
}());
exports.Pacem3D = Pacem3D;
var Pacem3DObject = (function () {
    function Pacem3DObject(pacem3dCtrl, elRef) {
        this.pacem3dCtrl = pacem3dCtrl;
        this.elRef = elRef;
        this.onClick = new core_1.EventEmitter();
        this.onOver = new core_1.EventEmitter();
        this.onOut = new core_1.EventEmitter();
    }
    Pacem3DObject.prototype.ngOnInit = function () {
        this.init();
    };
    Pacem3DObject.prototype.ngOnDestroy = function () {
        if (this.obj3D)
            this.pacem3dCtrl.scene.remove(this.obj3D);
    };
    Pacem3DObject.prototype.init = function () {
        var me = this;
        me.elRef.nativeElement[Pacem3DObject.datasetKey] = me;
        var scene = me.pacem3dCtrl.scene;
        function addToScene(obj) {
            me.obj3D = obj;
            obj.userData = me.tag;
            scene.add(obj);
        }
        var format = (me['format'] || 'native').toLowerCase();
        var object = me['object'];
        var position = me['position'];
        function then(object3D) {
            if (object3D) {
                var pos = position; // || new three.Vector3(0, 0, 0);
                if (typeof pos === 'string') {
                    var matches = parseVec3(pos);
                    pos = new three.Vector3(matches[0] || 0, matches[1] || 0, matches[2] || 0);
                }
                var posv = pos;
                if (posv) {
                    object3D.position.x = posv.x;
                    object3D.position.y = posv.y;
                    object3D.position.z = posv.z;
                }
                addToScene(object3D);
            }
        }
        switch (format) {
            case 'json':
                var loader = new THREE.JSONLoader();
                if (me.url)
                    loader.load(me.url, function (g, m) {
                        then(new THREE.Mesh(g, (m && m.length && m[0]) || new THREE.MeshLambertMaterial()));
                    });
                else {
                    var tuple = loader.parse(me.object), m = tuple.materials;
                    then(new THREE.Mesh(tuple.geometry, (m && m.length && m[0]) || new THREE.MeshLambertMaterial()));
                }
                break;
            // #region OBJ
            case 'obj':
                (function () {
                    var loader = new three_objmtlloader_1.OBJMTLLoader();
                    then(loader.parse(object));
                })();
                break;
            // #endregion
            // #region NATIVE
            case 'native':
                then(object);
                break;
        }
    };
    Object.defineProperty(Pacem3DObject.prototype, "boundingSphere", {
        get: function () {
            if (!(this.obj3D instanceof THREE.Mesh))
                return null;
            var mesh = this.obj3D;
            if (!mesh.geometry.boundingSphere) {
                mesh.geometry.computeBoundingSphere();
            }
            return mesh.geometry.boundingSphere;
        },
        enumerable: true,
        configurable: true
    });
    Pacem3DObject.prototype.getPointCoords = function (point) {
        var renderer = this.pacem3dCtrl.renderer;
        var widthHalf = 0.5 * renderer.domElement.width;
        var heightHalf = 0.5 * renderer.domElement.height;
        var vector = point.clone();
        vector.project(this.pacem3dCtrl.camera);
        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;
        return {
            x: vector.x,
            y: vector.y
        };
    };
    Object.defineProperty(Pacem3DObject.prototype, "projectionCircle", {
        get: function () {
            var sphere = this.boundingSphere;
            var center = this.obj3D.position.clone();
            var canvas = this.pacem3dCtrl.elementRef.nativeElement;
            var offset = pacem_core_1.PacemUtils.offset(canvas);
            var camera = this.pacem3dCtrl.camera;
            var pos = this.getPointCoords(center);
            var orthodir = center.clone().sub(camera.position).cross(camera.up).normalize().multiplyScalar(sphere.radius);
            var edge = this.getPointCoords(orthodir.sub(center));
            var radius = pacem_core_1.PacemUtils.distance(pos, edge); // Math.sqrt(Math.pow(pos.x - edge.x, 2) + Math.pow(pos.y - edge.y, 2));
            return {
                center: {
                    left: offset.left + pos.x,
                    top: offset.top + pos.y,
                }, radius: radius
            };
        },
        enumerable: true,
        configurable: true
    });
    Pacem3DObject.datasetKey = 'pacem3dObject';
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], Pacem3DObject.prototype, "tag", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], Pacem3DObject.prototype, "format", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Pacem3DObject.prototype, "object", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], Pacem3DObject.prototype, "url", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Pacem3DObject.prototype, "position", void 0);
    __decorate([
        core_1.Output('click'), 
        __metadata('design:type', Object)
    ], Pacem3DObject.prototype, "onClick", void 0);
    __decorate([
        core_1.Output('over'), 
        __metadata('design:type', Object)
    ], Pacem3DObject.prototype, "onOver", void 0);
    __decorate([
        core_1.Output('out'), 
        __metadata('design:type', Object)
    ], Pacem3DObject.prototype, "onOut", void 0);
    Pacem3DObject = __decorate([
        core_1.Directive({
            selector: 'pacem-3d-object'
        }), 
        __metadata('design:paramtypes', [Pacem3D, core_1.ElementRef])
    ], Pacem3DObject);
    return Pacem3DObject;
}());
exports.Pacem3DObject = Pacem3DObject;
var Pacem3DCamera = (function () {
    function Pacem3DCamera(pacem3dCtrl) {
        this.pacem3dCtrl = pacem3dCtrl;
        this.type = 'perspective';
        this.active = false;
        this.position = new THREE.Vector3();
        this.target = new THREE.Vector3();
    }
    Pacem3DCamera.prototype.ngOnChanges = function (changes) {
        if (!this.camera)
            return;
        if (changes['type'])
            this.init();
        this.checkCamera();
    };
    Pacem3DCamera.prototype.ngOnInit = function () {
        this.init();
        this.checkCamera();
    };
    Pacem3DCamera.prototype.ngOnDestroy = function () {
        this.destroyCamera();
    };
    Pacem3DCamera.prototype.destroyCamera = function () {
        if (!this.camera)
            return;
        this.pacem3dCtrl.scene.remove(this.camera);
        this.camera = null;
    };
    Pacem3DCamera.prototype.checkCamera = function () {
        if (this.camera && this.active) {
            this.pacem3dCtrl.setCamera(this.camera);
            //
            var renderer = this.pacem3dCtrl.renderer;
            if (!renderer)
                return;
            var camera = this.camera, canvas = renderer.domElement, w = canvas.clientWidth, h = canvas.clientHeight, ortho = camera, perspective = camera;
            if (this.lastW != w || this.lastH != h) {
                this.lastW = w;
                this.lastH = h;
                if (ortho) {
                    ortho.left = -.5 * w;
                    ortho.right = .5 * w;
                    ortho.top = .5 * h;
                    ortho.bottom = -.5 * h;
                }
                else {
                }
            }
            var p = new three.Vector3(), t = new three.Vector3();
            function merge(vec, v) {
                var p;
                if (typeof v === 'string') {
                    var matches = parseVec3(v || '0,0,0');
                    p = new THREE.Vector3(matches[0] || 0, vec.y = matches[1] || 0, vec.z = -matches[2] || 0);
                }
                else if (v != null) {
                    var p_1 = v;
                    vec.x = p_1.x;
                }
                if (p) {
                    vec.x = p.x;
                    vec.y = p.y;
                    vec.z = p.z;
                }
            }
            merge(p, this.position);
            merge(t, this.target);
            camera.position.x = p.x;
            camera.position.y = p.y;
            camera.position.z = p.z;
            camera.lookAt(t);
            if (perspective)
                perspective.updateProjectionMatrix();
        }
    };
    Pacem3DCamera.prototype.init = function () {
        this.destroyCamera();
        var scope = this, scene = scope.pacem3dCtrl.scene;
        var perspective, ortho;
        var lastW, lastH;
        switch ((scope.type || 'perspective').toLowerCase()) {
            case 'ortho':
            case 'orthographic':
                ortho = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
                break;
            default:
                perspective = new three.PerspectiveCamera(45, 1.78, 0.1, 1000);
                break;
        }
        this.camera = ortho || perspective;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], Pacem3DCamera.prototype, "type", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], Pacem3DCamera.prototype, "active", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Pacem3DCamera.prototype, "position", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Pacem3DCamera.prototype, "target", void 0);
    Pacem3DCamera = __decorate([
        core_1.Directive({
            selector: 'pacem-3d-camera'
        }), 
        __metadata('design:paramtypes', [Pacem3D])
    ], Pacem3DCamera);
    return Pacem3DCamera;
}());
exports.Pacem3DCamera = Pacem3DCamera;
var Pacem3DLight = (function () {
    function Pacem3DLight(pacem3dCtrl) {
        this.pacem3dCtrl = pacem3dCtrl;
        this.position = new THREE.Vector3();
        this.on = true;
        this.intensity = .25;
        this.color = 0xfff;
    }
    Object.defineProperty(Pacem3DLight.prototype, "light", {
        get: function () {
            return this._light;
        },
        enumerable: true,
        configurable: true
    });
    Pacem3DLight.prototype.ngOnInit = function () {
        this.init();
        this.checkLight();
    };
    Pacem3DLight.prototype.ngOnChanges = function () {
        if (!this.light)
            return;
        this.checkLight();
    };
    Pacem3DLight.prototype.ngOnDestroy = function () {
        this.destroyLight();
    };
    Pacem3DLight.prototype.destroyLight = function () {
        if (!this._light)
            return;
        this.pacem3dCtrl.scene.remove(this._light);
        this._light = null;
    };
    Pacem3DLight.prototype.checkLight = function () {
        var scope = this, light = scope._light;
        var matches = parseVec3(scope.position);
        var x = matches[0], y = matches[1], z = -matches[2];
        //
        light.position.set(x, y, z);
        light.target.position.set(x, 0, z);
        light.color = new THREE.Color(scope.color);
        light.visible = scope.on;
        light.intensity = scope.intensity;
    };
    Pacem3DLight.prototype.init = function () {
        this.destroyLight();
        var scope = this, scene = this.pacem3dCtrl.scene;
        var light = this._light = new three.SpotLight();
        light.castShadow = true;
        light.shadow.mapSize.width = 1;
        light.shadow.mapSize.height = 1;
        scene.add(light);
        var manageLight = function () {
        };
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], Pacem3DLight.prototype, "position", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], Pacem3DLight.prototype, "on", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], Pacem3DLight.prototype, "intensity", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], Pacem3DLight.prototype, "color", void 0);
    Pacem3DLight = __decorate([
        core_1.Directive({
            selector: 'pacem-3d-light'
        }), 
        __metadata('design:paramtypes', [Pacem3D])
    ], Pacem3DLight);
    return Pacem3DLight;
}());
exports.Pacem3DLight = Pacem3DLight;
var Pacem3DModule = (function () {
    function Pacem3DModule() {
    }
    Pacem3DModule = __decorate([
        core_1.NgModule({
            declarations: [Pacem3D, Pacem3DCamera, Pacem3DLight, Pacem3DObject],
            exports: [Pacem3D, Pacem3DCamera, Pacem3DLight, Pacem3DObject]
        }), 
        __metadata('design:paramtypes', [])
    ], Pacem3DModule);
    return Pacem3DModule;
}());
exports.Pacem3DModule = Pacem3DModule;
