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
var core_1 = require('@angular/core');
var pacem_net_1 = require('./../pacem/pacem-net');
var PacemNetComponent = (function () {
    function PacemNetComponent(hub, http) {
        this.hub = hub;
        this.http = http;
        this.counter = 0;
        this.meta = [];
        this.entity = {};
    }
    PacemNetComponent.prototype.ngOnInit = function () {
        var _this = this;
        var hub = this.hub;
        hub.name = 'pacemNg2Hub';
        hub.url = '/signalr';
        hub.on('notify', function (counter) {
            _this.counter = counter;
        });
        hub.start();
        //
        this.http.get('metadata-net.json')
            .success(function (response) {
            var meta = response.json;
            _this.meta = meta;
        });
    };
    PacemNetComponent.prototype.ngOnDestroy = function () {
        this.hub.stop();
    };
    PacemNetComponent.prototype.send = function (evt) {
        evt.preventDefault();
        //
        var ul = this.list.nativeElement;
        this.hub.invoke('echo', this.entity.message)
            .then(function (ret) {
            var li = document.createElement('li');
            li.innerText = ret + ' (from SignalR)';
            ul.appendChild(li);
        }, function (err) {
            var li = document.createElement('li');
            li.style.color = 'red';
            li.innerText = err;
            ul.appendChild(li);
        });
        this.entity.message = '';
    };
    __decorate([
        core_1.ViewChild('echo'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemNetComponent.prototype, "list", void 0);
    PacemNetComponent = __decorate([
        core_1.Component({
            selector: 'app-pacem-net',
            template: "<ul #echo>\n</ul>\n\n<p><b>{{ counter }}</b> message{{ counter == 1 ? ' has' : 's have' }} already been sent.</p>\n\n<pacem-field *ngFor=\"let item of meta\" [field]=\"item\" [entity]=\"entity\"></pacem-field>\n\n<button (click)=\"send($event)\" [disabled]=\"!entity.message\" class=\"pacem-btn primary\">Boomerang!</button>"
        }), 
        __metadata('design:paramtypes', [pacem_net_1.PacemHub, pacem_net_1.PacemHttp])
    ], PacemNetComponent);
    return PacemNetComponent;
}());
exports.PacemNetComponent = PacemNetComponent;
