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
var core_1 = require('@angular/core');
var pacem_core_1 = require('./pacem-core');
var noop = function () { };
/**
 * Vanilla implementation for http requests.
 */
var PacemHttp = (function () {
    function PacemHttp() {
        if (typeof window['XMLHttpRequest'] != 'function')
            throw pacem_core_1.pacem.localization.default.errors.NOT_EXPLOITABLE.replace(/%s/gi, 'XMLHttpRequest');
    }
    /**
     * Executes an asynchronous XMLHttpRequest over the net.
     * @param {String} url - Base url to be requested.
     * @param {Object} [options] - Options for the request.
     * @param {Object} [options.data] - Data to be sent along.
     * @param {String} [options.method=CORS] - HTTP Verb to be used.
     * @param {Function} [options.progress] - Callback on retrieval progress.
     */
    PacemHttp.prototype.request = function (url, options) {
        var _this = this;
        var deferred = pacem_core_1.PacemPromise.defer();
        options = options || {};
        var method = options.method || 'CORS';
        var data = options.data || {};
        var progress = options.progress || noop;
        var req = new XMLHttpRequest();
        req.addEventListener("progress", function (evt) {
            if (evt.lengthComputable) {
                var pct = evt.loaded / evt.total;
                // callback
                if (typeof progress === 'function')
                    progress.apply(_this, [pct]);
            }
        }, false);
        req.addEventListener("error", function () {
            // Network error occurred
            deferred.reject(Error(pacem_core_1.pacem.localization.default.errors.NETWORK));
        }, false);
        //req.addEventListener("abort", transferCanceled, false);
        req.addEventListener('load', function () {
            if (req.status == 200) {
                // Resolve the promise with the response
                var response = req.responseText;
                deferred.resolve(response);
            }
            else
                deferred.reject(Error(req.statusText));
        }, false);
        var params = data ? (typeof data == 'string' ? data : Object.keys(data).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]); }).join('&')) : undefined;
        switch (method.toLowerCase()) {
            case 'get':
                url += (/\?/.test(url) ? '&' : '?') + params;
                break;
        }
        //
        req.open(/^cors$/i.test(method) ? 'GET' : method, url, true);
        switch (method.toLowerCase()) {
            case 'get':
                req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                break;
            case 'post':
                req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                break;
        }
        //
        req.send(params);
        return deferred.promise;
    };
    /**
     * Short-hand for 'GET' request.
     */
    PacemHttp.prototype.get = function (url, data) {
        return this.request(url, { 'method': 'GET', 'data': data });
    };
    /**
     * Short-hand for 'CORS' request.
     */
    PacemHttp.prototype.cors = function (url, data) {
        return this.request(url, { 'data': data });
    };
    /**
     * Short-hand for 'POST' request.
     */
    PacemHttp.prototype.post = function (url, data) {
        return this.request(url, { 'method': 'POST', 'data': data });
    };
    PacemHttp = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PacemHttp);
    return PacemHttp;
}());
exports.PacemHttp = PacemHttp;
/**
 * SignalR wrapper for angular (needs jQuery >= 1.64).
 */
var PacemHub = (function () {
    function PacemHub() {
        this._disconnectCallbacks = [];
    }
    /**
     * Starts a new connection with a SignalR hub.
     * @param url hub url
     * @param hubName hub name
     * @param options connection options
     */
    PacemHub.prototype.start = function (url, hubName, options) {
        var _me = this;
        _me.connection = $.hubConnection();
        _me.connection.url = url;
        _me.proxy = _me.connection.createHubProxy(hubName);
        var _me = this;
        var deferred = pacem_core_1.PacemPromise.defer();
        _me.connection.start(options).done(function (conn) {
            console.info('connected to ' + hubName + ' (id: ' + _me.connection.id + ').');
            _me.connection.disconnected(function () {
                var args = arguments;
                _me._disconnectCallbacks.forEach(function (fn) {
                    fn.apply(_me, args);
                });
            });
            deferred.resolve(arguments);
        }).fail(function () {
            var err = 'Could not connect to ' + hubName + '.';
            for (var child in arguments)
                err += '\n' + child + ': ' + arguments[child];
            console.error(err);
            deferred.reject(arguments);
        });
        return deferred.promise;
    };
    /**
     * Stops the listening connection.
     */
    PacemHub.prototype.stop = function () {
        var _me = this;
        _me.connection.stop(true, true);
        _me.connection = null;
        _me.proxy = null;
    };
    /**
     * Invokes a server hub method with the given arguments.
     * @param methodName method name
     */
    PacemHub.prototype.invoke = function (methodName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _me = this;
        var deferred = pacem_core_1.PacemPromise.defer();
        _me.proxy.invoke.apply(_me.proxy, $.makeArray(arguments))
            .done(function () {
            deferred.resolve.apply(_me, arguments);
        }).fail(function () {
            deferred.reject.apply(_me, arguments);
        });
        return deferred.promise;
    };
    /**
     * Sets the handler for a given event name.
     * @param eventName message identifier
     * @param callback handler
     */
    PacemHub.prototype.on = function (eventName, callback) {
        var proxy = this.proxy;
        proxy.on(eventName, function () {
            var args = arguments;
            if (callback) {
                callback.apply(window, args);
            }
        });
    };
    /**
     * Removes the handler for a given event name.
     * @param eventName message identifier
     * @param callback handler
     */
    PacemHub.prototype.off = function (eventName, callback) {
        var proxy = this.proxy;
        proxy.off(eventName, function () {
            var args = arguments;
            if (callback) {
                callback.apply(window, args);
            }
        });
    };
    /**
     * Adds a disconnection callback.
     * @param callback
     */
    PacemHub.prototype.addDisconnected = function (callback) {
        if (typeof callback !== 'function')
            throw 'Not a function.';
        if (this._disconnectCallbacks.indexOf(callback) == -1)
            this._disconnectCallbacks.push(callback);
    };
    /**
     * Removes a previously added disconnection callback.
     * @param callback
     */
    PacemHub.prototype.removeDisconnected = function (callback) {
        var ndx = -1;
        if (callback && (ndx = this._disconnectCallbacks.indexOf(callback)) > -1)
            this._disconnectCallbacks.splice(ndx, 1);
    };
    PacemHub = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PacemHub);
    return PacemHub;
}());
exports.PacemHub = PacemHub;
var PacemNetModule = (function () {
    function PacemNetModule() {
    }
    PacemNetModule = __decorate([
        core_1.NgModule({
            providers: [PacemHttp, PacemHub]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemNetModule);
    return PacemNetModule;
}());
exports.PacemNetModule = PacemNetModule;
