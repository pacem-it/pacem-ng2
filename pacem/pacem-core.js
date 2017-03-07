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
var id = 'Pacem';
exports.pacem = window[id] = window[id] || {};
var JSON_DATE_PATTERN = /^\/Date\([\d]+\)\/$/i;
exports.pacem.localization = {
    'default': {
        'errors': { 'NOT_EXPLOITABLE': '%s feature not exploitable on this browser!', 'NETWORK': 'Network error occurred.', 'NOT_ARRAY': '%s is not an array', 'KEY_DUPLICATE': '%s is already a registered key' }
    }
};
var PacemUtils = PacemUtils_1 = (function () {
    function PacemUtils() {
    }
    Object.defineProperty(PacemUtils, "core", {
        get: function () { return exports.pacem; },
        enumerable: true,
        configurable: true
    });
    // #region GENERAL
    PacemUtils.uniqueCode = function () {
        var seed = exports.pacem.__currentSeed || new Date().valueOf();
        exports.pacem.__currentSeed = ++seed;
        var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var temp = seed;
        var sb = '';
        while (temp != 0) {
            var mod = temp % 62;
            sb = alphabet.charAt(mod) + sb;
            temp = Math.floor(temp / 62);
        }
        return sb;
    };
    PacemUtils.parseDate = function (input) {
        var d;
        if (typeof input === 'string') {
            if (JSON_DATE_PATTERN.test(input))
                d = parseInt(d.substring(6));
            else
                d = Date.parse(input);
            return new Date(d);
        }
        else
            return input;
    };
    // #region blob/files...
    // thanks to @cuixiping: http://stackoverflow.com/questions/23150333
    PacemUtils.blobToDataURL = function (blob) {
        var deferred = PacemPromise.defer();
        var a = new FileReader();
        a.onload = function (e) { deferred.resolve(e.target['result']); };
        a.readAsDataURL(blob);
        return deferred.promise;
    };
    PacemUtils.dataURLToBlob = function (dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };
    /**
     * Crops an image having the provided url (might be a dataURL) into another having the provided size
     * @param url
     * @param width
     * @param height
     * @param ctx
     */
    PacemUtils.cropImage = function (url, width, height) {
        var deferred = PacemPromise.defer();
        var el = new Image();
        el.onload = function (ev) {
            var cnv = document.createElement('canvas');
            var ctx = cnv.getContext('2d');
            if (width)
                ctx.canvas.width = width;
            if (height)
                ctx.canvas.height = height;
            PacemUtils_1.cropImageOntoCanvas(el, ctx);
            deferred.resolve(ctx.canvas.toDataURL());
        };
        el.src = url;
        return deferred.promise;
    };
    /**
     * Crops the snapshot of a drawable element onto a provided canvas context. It gets centered in the area anc cropped (`cover`-like behavior).
     * @param el drawable element
     * @param ctx canvas context
     * @param sourceWidth forced source width
     * @param sourceHeight forced source height
     */
    PacemUtils.cropImageOntoCanvas = function (el, ctx, sourceWidth, sourceHeight) {
        //
        var tgetW = ctx.canvas.width /*= parseFloat(scope.thumbWidth)*/;
        var tgetH = ctx.canvas.height /*= parseFloat(scope.thumbHeight)*/;
        var cnvW = tgetW, cnvH = tgetH;
        var w = sourceWidth || 1.0 * el.width, h = sourceHeight || 1.0 * el.height;
        //console.log('img original size: ' + w + 'x' + h);
        var ratio = w / h;
        var tgetRatio = tgetW / tgetH;
        if (tgetRatio > ratio) {
            // crop vertically
            var f = tgetW / w;
            tgetH = f * h;
            ctx.drawImage(el, 0, .5 * (-tgetH + cnvH), cnvW, tgetH);
        }
        else {
            // crop horizontally
            var f = tgetH / h;
            tgetW = f * w;
            ctx.drawImage(el, -Math.abs(.5 * (-tgetW + cnvW)), 0, tgetW, cnvH);
        }
    };
    // #endregion
    // #endregion
    // #region DOM
    PacemUtils.is = function (el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector)
            .call(el, selector);
    };
    PacemUtils.hasClass = function (el, className) {
        if (el.classList)
            return el.classList.contains(className);
        else
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    };
    PacemUtils.isVisible = function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0;
    };
    PacemUtils.addClass = function (el, className) {
        if (el.classList)
            DOMTokenList.prototype.add.apply(el.classList, className.split(' '));
        else
            el.className += ' ' + className;
    };
    PacemUtils.removeClass = function (el, className) {
        if (el.classList)
            DOMTokenList.prototype.remove.apply(el.classList, className.split(' '));
        else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    };
    PacemUtils.offset = function (el) {
        var rect = el.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    };
    PacemUtils.distance = function (p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };
    Object.defineProperty(PacemUtils, "windowSize", {
        get: function () {
            var win = window;
            return {
                width: win.innerWidth || win.document.documentElement.clientWidth || win.document.body.clientWidth || 0,
                height: win.innerHeight || win.document.documentElement.clientHeight || win.document.body.clientHeight || 0
            };
        },
        enumerable: true,
        configurable: true
    });
    PacemUtils.isEmpty = function (obj) {
        for (var child in obj)
            return false;
        try {
            return JSON.stringify({}) === JSON.stringify(obj);
        }
        catch (e) {
            return false;
        }
    };
    PacemUtils.extend = function (target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
            var source = sources_1[_a];
            if (typeof Object.assign != 'function') {
                Object.assign = function (target) {
                    'use strict';
                    if (target == null) {
                        throw new TypeError('Cannot convert undefined or null to object');
                    }
                    target = Object(target);
                    if (source != null) {
                        for (var key in source) {
                            if (Object.prototype.hasOwnProperty.call(source, key)) {
                                target[key] = source[key];
                            }
                        }
                    }
                };
            }
            else
                Object.assign(target, source);
        }
        return target;
    };
    PacemUtils.clone = function (obj) {
        if (obj === undefined)
            return undefined;
        return JSON.parse(JSON.stringify(obj));
    };
    return PacemUtils;
}());
PacemUtils = PacemUtils_1 = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], PacemUtils);
exports.PacemUtils = PacemUtils;
var PacemDate = (function () {
    function PacemDate() {
    }
    PacemDate.prototype.transform = function (d) {
        return PacemUtils.parseDate(d);
    };
    return PacemDate;
}());
PacemDate = __decorate([
    core_1.Pipe({ name: 'pacemDate' }),
    __metadata("design:paramtypes", [])
], PacemDate);
exports.PacemDate = PacemDate;
var PacemPromise = PacemPromise_1 = (function () {
    function PacemPromise() {
        this.deferred = null;
        var me = this;
        me.promise = new Promise(function (resolve, reject) {
            me.deferred = { 'resolve': resolve, 'reject': reject, 'promise': me };
        });
    }
    PacemPromise.prototype.then = function (onfulfilled, onrejected) {
        this.promise.then(onfulfilled, onrejected);
        return this;
    };
    /**
     * Occurs whenever the promise concludes (either after completion or error).
     * @param {Function } callback
     */
    PacemPromise.prototype.finally = function (callback) {
        this.promise.then(callback, callback);
        return this;
    };
    PacemPromise.prototype.success = function (callback) {
        this.promise.then(callback, null);
        return this;
    };
    PacemPromise.prototype.error = function (callback) {
        this.promise.then(null, callback);
        return this;
    };
    PacemPromise.defer = function () {
        var q = new PacemPromise_1();
        return q.deferred;
    };
    return PacemPromise;
}());
PacemPromise = PacemPromise_1 = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], PacemPromise);
exports.PacemPromise = PacemPromise;
var PacemProfile = (function () {
    function PacemProfile() {
    }
    PacemProfile.prototype.getStorage = function (persistent) {
        //TODO: if (mdz.localstorage)... cookies fallback
        return !!persistent ? window.localStorage : window.sessionStorage;
    };
    PacemProfile.prototype.setPropertyValue = function (name, value, persistent) {
        var storage = this.getStorage(persistent);
        storage.setItem(name, JSON.stringify(value));
        // delete omonymy
        storage = this.getStorage(!persistent);
        storage.removeItem(name);
    };
    PacemProfile.prototype.getPropertyValue = function (name) {
        var storage = this.getStorage(false);
        var retval;
        if ((retval = storage.getItem(name)) !== null)
            return JSON.parse(retval);
        retval = this.getStorage(true).getItem(name);
        if (retval === null)
            return retval;
        return JSON.parse(retval);
    };
    PacemProfile.prototype.clear = function () {
        var storage = this.getStorage(true);
        storage.clear();
        storage = this.getStorage(false);
        storage.clear();
    };
    ;
    PacemProfile.prototype.removeProperty = function (name) {
        var storage = this.getStorage(true);
        storage.removeItem(name);
        storage = this.getStorage(false);
        storage.removeItem(name);
    };
    return PacemProfile;
}());
PacemProfile = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], PacemProfile);
exports.PacemProfile = PacemProfile;
var PacemLooper = (function () {
    /**
     * Creates a new instance of Looper.
     */
    function PacemLooper() {
        this._startIndex = 0;
        this._stopped = false;
        this.deferred = PacemPromise.defer();
    }
    /**
     * `loopCallback` callback.
     *
     * @callback loopCallback
     * @param {Object} item
     * @param {Number} index
     */
    /**
     * Starts to loop.
     * @param { Array } array - Set of elements to be looped.
     * @param { loopCallback } callback - Callback to be executed at each loop.
     * @param { Object } [options] - Optional parameters like `debounce` and `synchronous`.
     */
    PacemLooper.prototype.loop = function (array, callback, options) {
        var _this = this;
        options = options || {};
        var fnLoop = options.debounce ? requestAnimationFrame : setTimeout;
        var fnUnloop = options.debounce ? cancelAnimationFrame : clearTimeout;
        if (!(array instanceof Array)) {
            // TODO: log error/msg
            return _this;
        }
        var j = _this._startIndex = _this._startIndex || 0;
        if (j < array.length && !_this._stopped) {
            // iter
            var item = array[j];
            if (typeof callback == 'function')
                callback.apply(_this, [item, j]);
            _this._startIndex++;
            if (!!options.synchronous)
                _this.loop(array, callback, options);
            else {
                _this._token = fnLoop(function () {
                    _this.loop(array, callback, options);
                }, options.debounce || undefined);
            }
        }
        else {
            if (_this._token)
                fnUnloop(_this._token);
            // complete
            _this.deferred[_this._stopped ? 'reject' : 'resolve'](array, /* reached index */ _this._startIndex, _this._stopped);
            delete _this._startIndex;
            delete _this._stopped;
        }
        return _this;
    };
    ;
    /**
     * Stops the ongoing loop.
     */
    PacemLooper.prototype.stop = function () {
        var _this = this;
        _this._stopped = true;
        return _this;
    };
    ;
    /**
     * `completeCallback` callback.
     *
     * @callback completeCallback
     * @param {Array} array - Original set of elements looped.
     * @param {Number} reachedIndex - Reached element index.
     * @param {Boolean} wasStopped - Whether the loop was stopped or not.
     */
    /**
     * Handles the completed (or stopped) loop
     * @param { completeCallback } callback - Callback to be executed at loop completion (or stop).
     */
    PacemLooper.prototype.complete = function (callback) {
        var _this = this;
        _this.deferred.promise['finally'](callback);
        return _this;
    };
    return PacemLooper;
}());
PacemLooper = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], PacemLooper);
exports.PacemLooper = PacemLooper;
var PacemCoreModule = (function () {
    function PacemCoreModule() {
    }
    return PacemCoreModule;
}());
PacemCoreModule = __decorate([
    core_1.NgModule({
        providers: [PacemProfile],
        declarations: [PacemDate],
        exports: [PacemDate]
    }),
    __metadata("design:paramtypes", [])
], PacemCoreModule);
exports.PacemCoreModule = PacemCoreModule;
var PacemUtils_1, PacemPromise_1;
