/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
import { Injectable, Pipe, NgModule } from '@angular/core';

var id: string = 'Pacem';
export declare var pacem;
pacem = window[id] = window[id] || {};

var JSON_DATE_PATTERN = /^\/Date\([\d]+\)\/$/i;
pacem.localization = {
    'default': {
        'errors': { 'NOT_EXPLOITABLE': '%s feature not exploitable on this browser!', 'NETWORK': 'Network error occurred.', 'NOT_ARRAY': '%s is not an array', 'KEY_DUPLICATE': '%s is already a registered key' }
    }
};

@Injectable()
export class PacemUtils {

    static get core() { return pacem; }

    // #region GENERAL

    static uniqueCode() {
        var seed = pacem.__currentSeed || new Date().valueOf();
        pacem.__currentSeed = ++seed;
        var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        var temp = seed;
        var sb = '';
        while (temp != 0) {
            var mod = temp % 62;
            sb = alphabet.charAt(mod) + sb;
            temp = Math.floor(temp / 62);
        }
        return sb;
    }

    static parseDate(input: string | Date): Date {
        let d: any;
        if (typeof input === 'string') {
            if (JSON_DATE_PATTERN.test(input))
                d = parseInt(d.substring(6));
            else
                d = Date.parse(input);
            return new Date(d);
        } else
            return input as Date;
    }

    // #region blob/files...
    // thanks to @cuixiping: http://stackoverflow.com/questions/23150333
    static blobToDataURL(blob: Blob) {
        var deferred = PacemPromise.defer<Blob>();
        var a = new FileReader();
        a.onload = function (e) { deferred.resolve(e.target['result']); }
        a.readAsDataURL(blob);
        return deferred.promise;
    }

    static dataURLToBlob(dataurl: string) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    /**
     * Crops an image having the provided url (might be a dataURL) into another having the provided size
     * @param url
     * @param width
     * @param height
     * @param ctx
     */
    static cropImage(url: string, width?: number, height?: number): PromiseLike<string> {
        var deferred = PacemPromise.defer<string>();
        let el = new Image();
        el.onload = function (ev) {
            let cnv = document.createElement('canvas');
            let ctx = cnv.getContext('2d');
            if (width) ctx.canvas.width = width;
            if (height) ctx.canvas.height = height;
            PacemUtils.cropImageOntoCanvas(el, ctx);
            deferred.resolve(ctx.canvas.toDataURL());
        };
        el.src = url;
        return deferred.promise;
    }

    /**
     * Crops the snapshot of a drawable element onto a provided canvas context. It gets centered in the area anc cropped (`cover`-like behavior).
     * @param el drawable element
     * @param ctx canvas context
     * @param sourceWidth forced source width
     * @param sourceHeight forced source height
     */
    static cropImageOntoCanvas(el: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, ctx: CanvasRenderingContext2D, sourceWidth?:number, sourceHeight?:number) {
        //
        let tgetW = ctx.canvas.width /*= parseFloat(scope.thumbWidth)*/;
        let tgetH = ctx.canvas.height /*= parseFloat(scope.thumbHeight)*/;
        let cnvW = tgetW, cnvH = tgetH;
        let w = sourceWidth || 1.0 * el.width, h = sourceHeight || 1.0 * el.height;
        //console.log('img original size: ' + w + 'x' + h);
        var ratio = w / h;
        var tgetRatio = tgetW / tgetH;
        if (tgetRatio > ratio) {
            // crop vertically
            var f = tgetW / w;
            tgetH = f * h;
            ctx.drawImage(el, 0, .5 * (-tgetH + cnvH), cnvW, tgetH);
        } else {
            // crop horizontally
            var f = tgetH / h;
            tgetW = f * w;
            ctx.drawImage(el, -Math.abs(.5 * (-tgetW + cnvW)), 0, tgetW, cnvH);
        }
    }
    // #endregion

    // #endregion

    // #region DOM

    static is(el: any, selector: string): boolean {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector)
            .call(el, selector);
    }

    static hasClass(el: HTMLElement, className: string): boolean {
        if (el.classList)
            return el.classList.contains(className);
        else
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }

    static isVisible(el: HTMLElement) {
        return el.offsetWidth > 0 || el.offsetHeight > 0;
    }

    static addClass(el: HTMLElement, className: string) {
        if (el.classList)
            DOMTokenList.prototype.add.apply(el.classList, className.split(' '));
        else
            el.className += ' ' + className;
    }

    static removeClass(el: HTMLElement, className: string) {
        if (el.classList)
            DOMTokenList.prototype.remove.apply(el.classList, className.split(' '));
        else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    static offset(el: Element): { top: number, left: number } {
        var rect = el.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }

    static distance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    static get windowSize() {
        let win = window;
        return {
            width: win.innerWidth || win.document.documentElement.clientWidth || win.document.body.clientWidth || 0,
            height: win.innerHeight || win.document.documentElement.clientHeight || win.document.body.clientHeight || 0
        };
    }

    static isEmpty(obj) {
        for (var child in obj)
            return false;
        try {
            return JSON.stringify({}) === JSON.stringify(obj);
        } catch (e) {
            return false;
        }
    }

    static extend(target, ...sources: any[]) {
        for (var source of sources) {
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
            else Object.assign(target, source);
        }
        return target;
    }

    static clone(obj: any) {
        if (obj === undefined) return undefined;
        return JSON.parse(JSON.stringify(obj));
    }

    // #endregion
}

@Pipe({ name: 'pacemDate' })
export class PacemDate {
    transform(d) {
        return PacemUtils.parseDate(d);
    }
}

@Injectable()
export class PacemPromise<T> {

    private promise: Promise<T>;
    private deferred: {
        'resolve': (v?: T) => void | PromiseLike<void>,
        'reject': (v?: any) => void | PromiseLike<void>,
        'promise': PacemPromise<T>
    } = null;

    constructor() {
        var me = this;
        me.promise = new Promise<T>(function (resolve, reject) {
            me.deferred = { 'resolve': resolve, 'reject': reject, 'promise': me };
        });
    }

    then(onCompleted: (v?: T) => void | PromiseLike<void>, onFailed?: (v?: any) => void | PromiseLike<void>) {
        this.promise.then(onCompleted, onFailed);
        return this;
    }

    /**
     * Occurs whenever the promise concludes (either after completion or error).
     * @param {Function } callback
     */
    finally(callback: (v?: T | any) => void | PromiseLike<void>) {
        this.promise.then(callback, callback);
        return this;
    }

    success(callback: (v?: T) => void | PromiseLike<void>) {
        this.promise.then(callback, null);
        return this;
    }

    error(callback: (v?: any) => void | PromiseLike<void>) {
        this.promise.then(null, callback);
        return this;
    }

    static defer<T>() {
        var q = new PacemPromise<T>();
        return q.deferred;
    }
}

@Injectable()
export class PacemProfile {

    private getStorage(persistent?: boolean): Storage {
        //TODO: if (mdz.localstorage)... cookies fallback
        return !!persistent ? window.localStorage : window.sessionStorage;
    }

    setPropertyValue(name: string, value: any, persistent?: boolean) {
        var storage = this.getStorage(persistent);
        storage.setItem(name, JSON.stringify(value));
        // delete omonymy
        storage = this.getStorage(!persistent);
        storage.removeItem(name);
    }

    getPropertyValue(name: string) {
        var storage = this.getStorage(false);
        var retval;
        if ((retval = storage.getItem(name)) !== null) return JSON.parse(retval);
        retval = this.getStorage(true).getItem(name);
        if (retval === null) return retval;
        return JSON.parse(retval);
    }

    clear() {
        var storage = this.getStorage(true);
        storage.clear();
        storage = this.getStorage(false);
        storage.clear();
    };

    removeProperty(name: string) {
        var storage = this.getStorage(true);
        storage.removeItem(name);
        storage = this.getStorage(false);
        storage.removeItem(name);
    }

}

@Injectable()
export class PacemLooper {
    /**
     * Creates a new instance of Looper.
     */
    constructor() {
        this.deferred = PacemPromise.defer();
    }

    private _startIndex = 0;
    private _stopped: boolean = false;
    private _token: number;
    private deferred: any;
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
    loop(array: any[], callback: (item: any, index: number) => void, options?: any) {
        var _this = this;
        options = options || {};
        var fnLoop: (callback: any, decounce?: number) => number = options.debounce ? requestAnimationFrame : setTimeout;
        var fnUnloop: (token: number) => void = options.debounce ? cancelAnimationFrame : clearTimeout;
        if (!(array instanceof Array)) {
            // TODO: log error/msg
            return _this;
        }
        var j = _this._startIndex = _this._startIndex || 0;
        if (j < array.length && !_this._stopped) {
            // iter
            var item = array[j];
            if (typeof callback == 'function') callback.apply(_this, [item, j]);
            _this._startIndex++;
            if (!!options.synchronous) _this.loop(array, callback, options);
            else {
                _this._token = fnLoop(() => {
                    _this.loop(array, callback, options);
                }, options.debounce || undefined);
            }
        } else {
            if (_this._token) fnUnloop(_this._token);
            // complete
            _this.deferred[_this._stopped ? 'reject' : 'resolve'](array, /* reached index */ _this._startIndex, _this._stopped);
            delete _this._startIndex;
            delete _this._stopped;
        }
        return _this;
    };

    /**
     * Stops the ongoing loop.
     */
    stop() {
        var _this = this;
        _this._stopped = true;
        return _this;
    };

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
    complete(callback) {
        var _this = this;
        _this.deferred.promise['finally'](callback);
        return _this;
    }

}

@NgModule({
    providers: [PacemProfile],
    declarations: [PacemDate],
    exports: [PacemDate]
})
export class PacemCoreModule { }