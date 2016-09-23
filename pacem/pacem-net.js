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
var PacemResponse = (function () {
    function PacemResponse(req, processTime) {
        if (!req)
            return;
        this._status = req.status;
        this._body = req.response;
        this._text = req.responseText;
        this._type = req.responseType;
        this._allHeadersRaw = req.getAllResponseHeaders();
        this._processTime = processTime;
    }
    Object.defineProperty(PacemResponse.prototype, "processTime", {
        get: function () {
            return this._processTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "headers", {
        get: function () {
            if (this._headers === undefined && this._allHeadersRaw)
                this._parseHeaders();
            return this._headers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "size", {
        get: function () {
            return +this.headers['Content-Length'];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "mime", {
        get: function () {
            return this.headers['Content-Type'];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "date", {
        get: function () {
            return new Date(Date.parse(this.headers['Date']));
        },
        enumerable: true,
        configurable: true
    });
    PacemResponse.prototype._parseHeaders = function () {
        var headers = {}, rows = this._allHeadersRaw.split('\r\n');
        rows.forEach(function (r) {
            if (r && r.length) {
                var index = r.indexOf(':');
                var key = r.substr(0, index).trim();
                var value = r.substr(index + 1).trim();
                headers[key] = value;
            }
        });
        this._headers = headers;
    };
    Object.defineProperty(PacemResponse.prototype, "status", {
        get: function () { return this._status; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "text", {
        get: function () { return this._text; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "content", {
        get: function () { return this._body; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "type", {
        get: function () { return this._type; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemResponse.prototype, "json", {
        /**
         * Short-hand utility for getting or parsing json content (if any).
         */
        get: function () {
            if (this._type === 'json')
                return this._body;
            else
                try {
                    return JSON.parse(this._text);
                }
                catch (e) {
                    return undefined;
                }
        },
        enumerable: true,
        configurable: true
    });
    return PacemResponse;
}());
exports.PacemResponse = PacemResponse;
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
     * @param {Object} [options.headers] - Key-value pairs of strings.
     * @param {Function} [options.progress] - Callback on retrieval progress.
     */
    PacemHttp.prototype.request = function (url, options) {
        var _this = this;
        var deferred = pacem_core_1.PacemPromise.defer();
        options = options || {};
        var method = options.method || 'CORS';
        var data = options.data || {};
        var progress = options.progress || noop;
        var headers = options.headers || {};
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
        var stopWatch;
        req.addEventListener('load', function () {
            if (req.status >= 200 && req.status < 300) {
                // Resolve the promise with the response
                var response = new PacemResponse(req, Date.now() - stopWatch);
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
        for (var kvp in headers) {
            req.setRequestHeader(kvp, headers[kvp]);
        }
        //
        stopWatch = Date.now();
        req.send(params);
        return deferred.promise;
    };
    /**
     * Short-hand for 'GET' request.
     */
    PacemHttp.prototype.get = function (url, data, headers) {
        return this.request(url, { 'method': 'GET', 'data': data, 'headers': headers || {} });
    };
    /**
     * Short-hand for 'CORS' request.
     */
    PacemHttp.prototype.cors = function (url, data, headers) {
        return this.request(url, { 'data': data, 'headers': headers || {} });
    };
    /**
     * Short-hand for 'POST' request.
     */
    PacemHttp.prototype.post = function (url, data, headers) {
        return this.request(url, { 'method': 'POST', 'data': data, 'headers': headers || {} });
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
    Object.defineProperty(PacemHub.prototype, "url", {
        get: function () {
            return this._url;
        },
        set: function (v) {
            if (v == this._url)
                return;
            this._url = v;
            this.reset();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemHub.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (v) {
            if (v == this._name)
                return;
            this._name = v;
            this.reset();
        },
        enumerable: true,
        configurable: true
    });
    PacemHub.prototype.reset = function () {
        var _me = this;
        if (_me.connection) {
            _me.connection.stop();
            _me.connection = null;
        }
        if (!this._url || !this._name)
            return;
        //
        _me.connection = $.hubConnection();
        _me.connection.url = this._url;
        _me.proxy = _me.connection.createHubProxy(this._name);
    };
    /**
     * Starts a new connection with a SignalR hub.
     * @param url hub url
     * @param hubName hub name
     * @param options connection options
     */
    PacemHub.prototype.start = function (options) {
        var _me = this;
        var hubName = _me._name;
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
