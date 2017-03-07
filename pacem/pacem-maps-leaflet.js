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
/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var common_1 = require("@angular/common");
var pacem_ui_1 = require("./pacem-ui");
var consts = {
    TIMEOUT: 1000,
    MAP_SELECTOR: 'pacem-map',
    LINK_SELECTOR: 'pacem-map-link',
    MARKER_SELECTOR: 'pacem-map-marker',
    POLYLINE_SELECTOR: 'pacem-map-polyline',
    CIRCLE_SELECTOR: 'pacem-map-circle'
};
var utils = {
    parseCoords: function (input) {
        if (input instanceof Array)
            return input;
        else if (/^\s*(\+|-)?[\d]+(.[\d]+)?\s*,\s*(\+|-)?[\d]+(.[\d]+)?\s*$/.test(input)) {
            var splitted = input.split(',');
            return [parseFloat(splitted[0]), parseFloat(splitted[1])];
        }
        return [0, 0];
    },
    expandBounds: function (bnds, latLng) {
        if (latLng)
            bnds.push([latLng.lat, latLng.lng]);
    },
    isContentEmpty: function (element) {
        return element.children.length == 0 || element.innerHTML == '<div></div>'; // TODO: investigate why ngContent adds empty div(?)
    }
};
//#region LINK
var PacemMapLink = (function () {
    function PacemMapLink(sanitizer) {
        this.sanitizer = sanitizer;
        this.target = '';
        this.link = '#';
    }
    PacemMapLink.prototype.ngOnChanges = function () {
        this.updateLink();
    };
    PacemMapLink.prototype.updateLink = function () {
        var coords0 = utils.parseCoords(this.target);
        var coords = coords0[0] + ',' + coords0[1];
        var url = 'geo:' + coords;
        if ((/Windows/i.test(window.navigator.userAgent))) {
            url = 'ms-drive-to:?destination.latitude=' + coords0[0] + '&destination.longitude=' + coords0[1];
        }
        this.link = this.sanitizer.bypassSecurityTrustUrl(url);
    };
    return PacemMapLink;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], PacemMapLink.prototype, "target", void 0);
PacemMapLink = __decorate([
    core_1.Component({
        selector: consts.LINK_SELECTOR,
        template: '<a [href]="link"><ng-content></ng-content></a>'
    }),
    __metadata("design:paramtypes", [platform_browser_1.DomSanitizer])
], PacemMapLink);
exports.PacemMapLink = PacemMapLink;
//#endregion
// #region MAP
var PacemMap = (function () {
    //#region ctor
    function PacemMap() {
        //#region properties
        this.zoom = 12;
        this.center = "44.714188025077984,10.296516444873811";
        this.tiles = '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        this.attribution = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        this.scale = true;
        /**
        * zoom control position
        */
        this.zoomControl = null;
        this.draggable = true;
        this.doubleClickZoom = true;
        this.keyboardShortcuts = true;
        this.paddingTop = 0;
        this.paddingLeft = 0;
        this.paddingRight = 0;
        this.paddingBottom = 0;
        //#endregion
        this.mapLoaded = new core_1.EventEmitter();
        //#endregion
        //#region fields
        this.map = null;
        this.markers = [];
        this.tileLayer = null;
        this.shapes = [];
        //#endregion
        this._throttler = 0;
        this.idleTimeoutHandler = 0;
    }
    //#endregion
    //#region lifecycle
    PacemMap.prototype.ngOnChanges = function () {
        this.invalidateMapSize();
    };
    PacemMap.prototype.ngAfterContentInit = function () {
        this.initialize();
    };
    PacemMap.prototype.onResize = function () {
        this.invalidateMapSize();
    };
    PacemMap.prototype._resetThrottler = function () {
        var _this = this;
        clearTimeout(this._throttler);
        this._throttler = window.setTimeout(function () { return _this._fitBounds(); }, consts.TIMEOUT);
    };
    ;
    // #region public methods
    PacemMap.prototype.getMap = function () {
        return this.map;
    };
    PacemMap.prototype.addMarker = function (marker) {
        this._resetThrottler();
        this.markers.push(marker);
    };
    PacemMap.prototype.removeMarker = function (marker) {
        this._resetThrottler();
        this.markers.splice(this.markers.indexOf(marker), 1);
    };
    PacemMap.prototype.addShape = function (shape) {
        this._resetThrottler();
        this.shapes.push(shape);
    };
    PacemMap.prototype.removeShape = function (shape) {
        this._resetThrottler();
        this.shapes.splice(this.shapes.indexOf(shape), 1);
    };
    PacemMap.prototype.fitBounds = function () {
        this._resetThrottler();
    };
    // #endregion
    PacemMap.prototype._fitBounds = function () {
        if (!this.map)
            return;
        var ctrl = this;
        var markers = ctrl.markers, shapes = this.shapes;
        // no markers
        if (!markers.length && !shapes.length) {
            ctrl.map.setZoom(ctrl['zoom']);
            ctrl.map.setView(utils.parseCoords(ctrl['center']));
            return;
        }
        var bnds = [];
        for (var _i = 0, markers_1 = markers; _i < markers_1.length; _i++) {
            var m = markers_1[_i];
            utils.expandBounds(bnds, m.getLatLng());
        }
        for (var _a = 0, shapes_1 = shapes; _a < shapes_1.length; _a++) {
            var s = shapes_1[_a];
            var bx = s.getBounds();
            utils.expandBounds(bnds, bx.getSouthWest());
            utils.expandBounds(bnds, bx.getNorthEast());
        }
        var minZoom;
        var paddingTop = this.paddingTop, paddingLeft = this.paddingLeft, paddingRight = this.paddingRight, paddingBottom = this.paddingBottom;
        var pads = { 'paddingTopLeft': new L.Point(paddingLeft, paddingTop), 'paddingBottomRight': new L.Point(paddingRight, paddingBottom) };
        if (bnds.length >= 2 || (bnds.length == 1 && (paddingTop || paddingLeft || paddingBottom || paddingRight)))
            this.map.fitBounds(new L.LatLngBounds(bnds), pads);
        else {
            if (bnds.length == 1)
                ctrl.map.setView(bnds[0]);
            if (minZoom = this.zoom)
                ctrl.map.setZoom(minZoom);
        }
    };
    ;
    PacemMap.prototype.redrawMap = function () {
        var ctrl = this;
        if (ctrl.tiles)
            ctrl.tileLayer.setUrl(this.tiles);
    };
    PacemMap.prototype.invalidateMapSize = function () {
        var ctrl = this;
        if (ctrl.map)
            ctrl.map.invalidateSize({});
    };
    PacemMap.prototype.initialize = function () {
        var ctrl = this;
        var scale = ctrl['scale'];
        var draggable = ctrl['draggable'];
        var dblClickZoom = ctrl['doubleClickZoom'];
        var kbShortcuts = ctrl['keyboardShortcuts'];
        //
        var center = L.latLng(utils.parseCoords(ctrl.center));
        var mapOptions = {
            zoomControl: scale && !ctrl.zoomControl,
            scrollWheelZoom: scale,
            dragging: draggable,
            doubleClickZoom: !dblClickZoom,
            keyboard: kbShortcuts
        };
        var container = this.canvas.nativeElement;
        var mapElement = document.createElement('div');
        mapElement.style.width = '100%';
        mapElement.style.height = '100%';
        container.appendChild(mapElement);
        var map = ctrl.map = L.map(mapElement, mapOptions);
        if (scale && ctrl.zoomControl)
            map.addControl(L.control.zoom({
                position: ctrl['zoomControl']
            }));
        map.on('moveend', function () { return ctrl.idleFiller(); });
        map.on('load', function () { return ctrl.idleFiller(); });
        ctrl.tileLayer = L.tileLayer(this.tiles, { attribution: this.attribution }).addTo(map);
        // setting now the center and zoom, triggers the "load" event and activates the child-components, if any.
        /*
        LeafletJS docs: Map's "load" Event
        "Fired when the map is initialized (when its center and zoom are set for the first time)."
        (http://leafletjs.com/reference.html#map-events)
        */
        map.setView(center, ctrl.zoom);
        /*map.on('idle', function (evt) {
            if ('radar' in $attrs) {
                var model = $scope[$attrs['radar']] = $scope[$attrs['radar']] || {};
                var cntr = map.getCenter();
                var zm = map.getZoom();
                var bnds = map.getBounds();
                var ne = bnds.getNorthEast();
                var sw = bnds.getSouthWest();
                var nw = bnds.getNorthWest();
                var se = bnds.getSouthEast();
                var current = {
                    'ne': ne, 'sw': sw, 'se': se, 'nw': nw, 'center': cntr, 'zoom': zm
                };
                if (!ng.equals(model, current))
                    $scope.$applyAsync(function () {
                        ng.extend(model, current);
                    });
            }
        });*/
        // first-load
        ctrl.map.once('idle', function () {
            ctrl.map.fire('resize');
            ctrl.mapLoaded.emit({});
        });
        // call setView NOW to trigger the load event :(
        map.setView(utils.parseCoords(this.center));
    };
    PacemMap.prototype.idleFiller = function () {
        var ctrl = this;
        clearTimeout(ctrl.idleTimeoutHandler);
        ctrl.idleTimeoutHandler = window.setTimeout(function () {
            if (ctrl.map)
                ctrl.map.fire('idle');
        }, 500);
    };
    ;
    return PacemMap;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMap.prototype, "zoom", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMap.prototype, "center", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMap.prototype, "tiles", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMap.prototype, "attribution", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], PacemMap.prototype, "scale", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMap.prototype, "zoomControl", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], PacemMap.prototype, "draggable", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], PacemMap.prototype, "doubleClickZoom", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], PacemMap.prototype, "keyboardShortcuts", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMap.prototype, "paddingTop", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMap.prototype, "paddingLeft", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMap.prototype, "paddingRight", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMap.prototype, "paddingBottom", void 0);
__decorate([
    core_1.Output('loaded'),
    __metadata("design:type", Object)
], PacemMap.prototype, "mapLoaded", void 0);
__decorate([
    core_1.ViewChild('mapCanvas'),
    __metadata("design:type", core_1.ElementRef)
], PacemMap.prototype, "canvas", void 0);
PacemMap = __decorate([
    core_1.Component({
        selector: consts.MAP_SELECTOR,
        template: "<div class=\"pacem-map\" #mapCanvas (window:resize)=\"onResize($event)\"></div>"
    }),
    __metadata("design:paramtypes", [])
], PacemMap);
exports.PacemMap = PacemMap;
// #endregion
//#region MARKER
var PacemMapMarker = (function () {
    function PacemMapMarker(map) {
        var _this = this;
        this.position = '';
        this.icon = null;
        this.size = null;
        this.anchor = null;
        this.popupAnchor = null;
        this.draggable = false;
        this.ondrag = new core_1.EventEmitter();
        this.oninfo = new core_1.EventEmitter();
        this.onclose = new core_1.EventEmitter();
        this.mapCmp = null;
        this.marker = null;
        this.mapCmp = map;
        this.mapCmp.mapLoaded.subscribe(function () { return _this.ensureMarker(); });
    }
    // methods/events
    PacemMapMarker.prototype.onDragEnd = function () {
        this.ondrag.emit({ position: this.marker.getLatLng() });
    };
    PacemMapMarker.prototype.onInfo = function () {
        this.oninfo.emit({});
    };
    PacemMapMarker.prototype.onClose = function () {
        this.onclose.emit({});
    };
    PacemMapMarker.prototype.isMapInitialized = function () {
        return !!(this.mapCmp && this.mapCmp.getMap());
    };
    PacemMapMarker.prototype.isMarkerInitialized = function () {
        return !!(this.isMapInitialized() && this.marker);
    };
    PacemMapMarker.prototype.ngOnChanges = function (changes) {
        this.ensureMarker();
    };
    PacemMapMarker.prototype.ngOnDestroy = function () {
        if (this.isMapInitialized()) {
            this.mapCmp.mapLoaded.unsubscribe();
            //
            if (this.marker) {
                this.mapCmp.removeMarker(this.marker);
                this.mapCmp.getMap().removeLayer(this.marker);
            }
        }
        delete this.marker;
    };
    PacemMapMarker.prototype.ensureMarker = function () {
        var ctrl = this;
        if (!ctrl.isMapInitialized())
            return;
        if (!ctrl.marker) {
            ctrl.marker = L.marker(utils.parseCoords(ctrl['position'])).addTo(ctrl.mapCmp.getMap());
            ctrl.marker.on('click', function () { return ctrl.openInfoWindow(); });
            ctrl.marker.on('drag', function () { return ctrl.mapCmp.fitBounds(); });
            ctrl.marker.on('dragend', function () { return ctrl.onDragEnd(); });
            ctrl.mapCmp.addMarker(ctrl.marker);
        }
        ctrl.setPosition(ctrl['position']);
        ctrl.setIcon(ctrl['icon']);
        ctrl.setCaption();
        ctrl.setDraggable();
    };
    PacemMapMarker.prototype.openInfoWindow = function () {
        var ctrl = this;
        var domElement = ctrl.contentElement.nativeElement;
        if (!utils.isContentEmpty(domElement)) {
            ctrl.marker
                .bindPopup(domElement)
                .openPopup();
            ctrl.onInfo();
            ctrl.marker.on('popupclose', function () {
                ctrl.marker.unbindPopup();
                ctrl.onClose();
            });
        }
    };
    PacemMapMarker.prototype.setDraggable = function (v) {
        if (!this.isMarkerInitialized())
            return;
        if (v || this['draggable'])
            this.marker.dragging.enable();
        else
            this.marker.dragging.disable();
    };
    PacemMapMarker.prototype.setPosition = function (p) {
        if (!this.isMarkerInitialized())
            return;
        var position = utils.parseCoords(p);
        this.marker.setLatLng(position);
        //
        this.mapCmp.fitBounds();
    };
    PacemMapMarker.prototype.setIcon = function (v) {
        if (!this.isMarkerInitialized())
            return;
        var marker = this.marker;
        if (typeof v === 'string') {
            var icon = { 'iconUrl': v }, size, anchor, popup;
            if ((size = this['size']) && /[\d]+,[\d]+/.test(size)) {
                var ndx = -1;
                var size0 = [parseInt(size.substring(0, (ndx = size.indexOf(',')))), parseInt(size.substring(ndx + 1))];
                Object.assign(icon, { 'iconSize': size0 });
            }
            if ((anchor = this['anchor']) && /[\d]+,[\d]+/.test(anchor)) {
                var ndx = -1;
                var anchor0 = [parseInt(anchor.substring(0, (ndx = anchor.indexOf(',')))), parseInt(anchor.substring(ndx + 1))];
                Object.assign(icon, { 'iconAnchor': anchor0, 'popupAnchor': [0, -anchor0[1]] });
            }
            if ((popup = this['popupAnchor']) && /[\d]+,[\d]+/.test(popup)) {
                var ndx = -1;
                var anchor0 = [parseInt(anchor.substring(0, (ndx = anchor.indexOf(',')))), parseInt(anchor.substring(ndx + 1))];
                Object.assign(icon, { 'popupAnchor': anchor0 });
            }
            marker.setIcon(L.icon(icon));
        }
        else if (v)
            marker.setIcon(v);
    };
    PacemMapMarker.prototype.setCaption = function () {
        if (!this.isMarkerInitialized())
            return;
        var marker = this.marker, content = this.contentElement.nativeElement;
        if (marker.getPopup() && marker.getPopup().getContent() != content)
            marker.setPopupContent(content);
    };
    return PacemMapMarker;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], PacemMapMarker.prototype, "position", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMapMarker.prototype, "icon", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMapMarker.prototype, "size", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMapMarker.prototype, "anchor", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMapMarker.prototype, "popupAnchor", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], PacemMapMarker.prototype, "draggable", void 0);
__decorate([
    core_1.Output('drag'),
    __metadata("design:type", Object)
], PacemMapMarker.prototype, "ondrag", void 0);
__decorate([
    core_1.Output('info'),
    __metadata("design:type", Object)
], PacemMapMarker.prototype, "oninfo", void 0);
__decorate([
    core_1.Output('close'),
    __metadata("design:type", Object)
], PacemMapMarker.prototype, "onclose", void 0);
__decorate([
    core_1.ViewChild('content'),
    __metadata("design:type", core_1.ElementRef)
], PacemMapMarker.prototype, "contentElement", void 0);
PacemMapMarker = __decorate([
    core_1.Component({
        selector: consts.MARKER_SELECTOR,
        template: "<div class=\"pacem-map-marker-info\" #content><ng-content></ng-content><div>"
    }),
    __metadata("design:paramtypes", [PacemMap])
], PacemMapMarker);
exports.PacemMapMarker = PacemMapMarker;
//#endregion
//#region CIRCLE
var PacemMapCircle = (function () {
    function PacemMapCircle(map) {
        var _this = this;
        this.radius = 0;
        this.center = '';
        this.stroke = '';
        this.fill = '';
        this.thickness = 2;
        this.oninfo = new core_1.EventEmitter();
        this.onclose = new core_1.EventEmitter();
        this.mapCmp = null;
        this.circle = null;
        this.mapCmp = map;
        this.mapCmp.mapLoaded.subscribe(function () { return _this.ensureCircle(); });
    }
    // methods/events
    PacemMapCircle.prototype.onInfo = function () {
        this.oninfo.emit({});
    };
    PacemMapCircle.prototype.onClose = function () {
        this.onclose.emit({});
    };
    PacemMapCircle.prototype.onClick = function (evt) {
        var ctrl = this;
        var domElement = ctrl.contentElement.nativeElement;
        if (!utils.isContentEmpty(domElement)) {
            ctrl.circle
                .bindPopup(domElement)
                .openPopup();
            ctrl.onInfo();
            ctrl.circle.on('popupclose', function () {
                ctrl.circle.unbindPopup();
                ctrl.onClose();
            });
        }
    };
    PacemMapCircle.prototype.isMapInitialized = function () {
        return !!(this.mapCmp && this.mapCmp.getMap());
    };
    PacemMapCircle.prototype.isCircleInitialized = function () {
        return !!(this.isMapInitialized() && this.circle);
    };
    PacemMapCircle.prototype.ngOnChanges = function (changes) {
        this.ensureCircle();
    };
    PacemMapCircle.prototype.ngOnDestroy = function () {
        if (this.isMapInitialized()) {
            this.mapCmp.mapLoaded.unsubscribe();
            //
            if (this.circle) {
                this.mapCmp.removeShape(this.circle);
                this.mapCmp.getMap().removeLayer(this.circle);
            }
        }
        delete this.circle;
    };
    PacemMapCircle.prototype.ensureCircle = function () {
        var ctrl = this;
        if (!ctrl.isMapInitialized())
            return;
        if (!ctrl.circle) {
            var center = utils.parseCoords(ctrl['center']);
            var radius = ctrl['radius'] || .0;
            ctrl.circle = L.circle(center, radius).addTo(ctrl.mapCmp.getMap());
            ctrl.mapCmp.addShape(ctrl.circle);
            ctrl.circle.on('click', function () { return ctrl.onClick(); });
        }
        ctrl.setLayout(ctrl['center'], ctrl['radius']);
        ctrl.setStroke(ctrl['stroke']);
        ctrl.setFill(ctrl['fill']);
        ctrl.setThickness(Math.floor(ctrl['thickness']));
    };
    PacemMapCircle.prototype.setLayout = function (c, r) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized())
            return;
        var radius = parseFloat(r) || 0;
        ctrl.circle.setRadius(radius);
        var center = utils.parseCoords(c);
        ctrl.circle.setLatLng(center);
        ctrl.mapCmp.fitBounds();
    };
    PacemMapCircle.prototype.setFill = function (clr) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized())
            return;
        ctrl.circle.setStyle({ 'fillColor': (clr || 'rgba(108,145,183,0.25)') });
    };
    PacemMapCircle.prototype.setStroke = function (clr) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized())
            return;
        ctrl.circle.setStyle({ 'color': (clr || 'rgb(108,145,183)') });
    };
    PacemMapCircle.prototype.setThickness = function (th) {
        var ctrl = this;
        if (!ctrl.isCircleInitialized())
            return;
        ctrl.circle.setStyle({ 'weight': th || 3 });
    };
    return PacemMapCircle;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMapCircle.prototype, "radius", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], PacemMapCircle.prototype, "center", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMapCircle.prototype, "stroke", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMapCircle.prototype, "fill", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMapCircle.prototype, "thickness", void 0);
__decorate([
    core_1.Output('info'),
    __metadata("design:type", Object)
], PacemMapCircle.prototype, "oninfo", void 0);
__decorate([
    core_1.Output('close'),
    __metadata("design:type", Object)
], PacemMapCircle.prototype, "onclose", void 0);
__decorate([
    core_1.ViewChild('content'),
    __metadata("design:type", core_1.ElementRef)
], PacemMapCircle.prototype, "contentElement", void 0);
PacemMapCircle = __decorate([
    core_1.Component({
        selector: consts.CIRCLE_SELECTOR,
        template: "<div class=\"pacem-map-circle-info\" #content><ng-content></ng-content><div>"
    }),
    __metadata("design:paramtypes", [PacemMap])
], PacemMapCircle);
exports.PacemMapCircle = PacemMapCircle;
//#endregion
//#region POLYLINE
var PacemMapPolyline = (function () {
    function PacemMapPolyline(map) {
        var _this = this;
        this.path = [];
        this.stroke = '';
        this.thickness = 2;
        this.oninfo = new core_1.EventEmitter();
        this.onclose = new core_1.EventEmitter();
        this.mapCmp = null;
        this.polyline = null;
        this.mapCmp = map;
        this.mapCmp.mapLoaded.subscribe(function () { return _this.ensurePolyline(); });
    }
    // methods/events
    PacemMapPolyline.prototype.onInfo = function () {
        this.oninfo.emit({});
    };
    PacemMapPolyline.prototype.onClose = function () {
        this.onclose.emit({});
    };
    PacemMapPolyline.prototype.onClick = function (evt) {
        var ctrl = this;
        var domElement = ctrl.contentElement.nativeElement;
        if (!utils.isContentEmpty(domElement)) {
            ctrl.polyline
                .bindPopup(domElement)
                .openPopup();
            ctrl.onInfo();
            ctrl.polyline.on('popupclose', function () {
                ctrl.polyline.unbindPopup();
                ctrl.onClose();
            });
        }
    };
    PacemMapPolyline.prototype.isMapInitialized = function () {
        return !!(this.mapCmp && this.mapCmp.getMap());
    };
    PacemMapPolyline.prototype.isShapeInitialized = function () {
        return !!(this.isMapInitialized() && this.polyline);
    };
    PacemMapPolyline.prototype.ngOnChanges = function (changes) {
        this.ensurePolyline();
    };
    PacemMapPolyline.prototype.ngOnDestroy = function () {
        if (this.isMapInitialized()) {
            this.mapCmp.mapLoaded.unsubscribe();
            //
            if (this.polyline) {
                this.mapCmp.removeShape(this.polyline);
                this.mapCmp.getMap().removeLayer(this.polyline);
            }
        }
        delete this.polyline;
    };
    PacemMapPolyline.prototype.ensurePolyline = function () {
        var ctrl = this;
        if (!ctrl.isMapInitialized())
            return;
        if (!ctrl.polyline) {
            var path = ctrl['path'];
            ctrl.polyline = L.polyline(path).addTo(ctrl.mapCmp.getMap());
            ctrl.mapCmp.addShape(ctrl.polyline);
            ctrl.polyline.on('click', function () { return ctrl.onClick(); });
        }
        ctrl.setLayout(ctrl['path']);
        ctrl.setStroke(ctrl['stroke']);
        ctrl.setThickness(Math.floor(ctrl['thickness']));
    };
    PacemMapPolyline.prototype.setLayout = function (c) {
        var ctrl = this;
        if (!ctrl.isShapeInitialized())
            return;
        ctrl.polyline.setLatLngs(c);
        ctrl.mapCmp.fitBounds();
    };
    PacemMapPolyline.prototype.setStroke = function (clr) {
        var ctrl = this;
        if (!ctrl.isShapeInitialized())
            return;
        ctrl.polyline.setStyle({ 'color': (clr || 'rgb(108,145,183)') });
    };
    PacemMapPolyline.prototype.setThickness = function (th) {
        var ctrl = this;
        if (!ctrl.isShapeInitialized())
            return;
        ctrl.polyline.setStyle({ 'weight': th || 3 });
    };
    return PacemMapPolyline;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], PacemMapPolyline.prototype, "path", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemMapPolyline.prototype, "stroke", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemMapPolyline.prototype, "thickness", void 0);
__decorate([
    core_1.Output('info'),
    __metadata("design:type", Object)
], PacemMapPolyline.prototype, "oninfo", void 0);
__decorate([
    core_1.Output('close'),
    __metadata("design:type", Object)
], PacemMapPolyline.prototype, "onclose", void 0);
__decorate([
    core_1.ViewChild('content'),
    __metadata("design:type", core_1.ElementRef)
], PacemMapPolyline.prototype, "contentElement", void 0);
PacemMapPolyline = __decorate([
    core_1.Component({
        selector: consts.POLYLINE_SELECTOR,
        template: "<div class=\"pacem-map-polyline-info\" #content><ng-content></ng-content><div>"
    }),
    __metadata("design:paramtypes", [PacemMap])
], PacemMapPolyline);
exports.PacemMapPolyline = PacemMapPolyline;
//#endregion
var PacemMapsLeafletModule = (function () {
    function PacemMapsLeafletModule() {
    }
    return PacemMapsLeafletModule;
}());
PacemMapsLeafletModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, pacem_ui_1.PacemUIModule],
        declarations: [PacemMap, PacemMapCircle, PacemMapLink, PacemMapMarker, PacemMapPolyline],
        exports: [PacemMap, PacemMapCircle, PacemMapLink, PacemMapMarker, PacemMapPolyline]
    }),
    __metadata("design:paramtypes", [])
], PacemMapsLeafletModule);
exports.PacemMapsLeafletModule = PacemMapsLeafletModule;
