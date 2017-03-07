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
var core_1 = require("@angular/core");
var PacemInfiniteScrollComponent = (function () {
    function PacemInfiniteScrollComponent() {
        this.items = [];
        this.enabled = true;
    }
    PacemInfiniteScrollComponent.prototype.fetch = function () {
        var amount = 20;
        for (var j = 0; j < amount; j++) {
            var ndx1 = this.items.length + 1;
            this.items.push({ id: ndx1, label: "Item " + ndx1.toString() });
        }
    };
    PacemInfiniteScrollComponent.prototype.toggleVisibility = function (i, evt) {
        i.visible = evt.visible;
    };
    return PacemInfiniteScrollComponent;
}());
PacemInfiniteScrollComponent = __decorate([
    core_1.Component({
        selector: 'app-pacem-infinite-scroll',
        template: "<h2 class=\"pacem-animatable\">Pacem Infinite Scroll</h2>\n\n<ol (pacemInfiniteScroll)=\"fetch($event)\" [pacemInfiniteScrollEnabled]=\"items.length < 500 && enabled\" pacemInfiniteScrollContainer=\"$document\">\n    <li *ngFor=\"let item of items\">\n        <div class=\"card\" (pacemInViewport)=\"toggleVisibility(item, $event)\">{{ item.label }} (visible: {{ !!item.visible }})</div></li>\n</ol>\n",
        styles: [
            'ol > li { display: inline-block; font-size: 0; width: 25%; }',
            '.card { transition: opacity 1s; opacity: 0.25; font-size: 12px; color: #000; border: 1px solid #c0c0c0; background: #fff; padding: 48px 24px; }',
            '.card.pacem-in-viewport { opacity: 1 }'
        ]
    }),
    __metadata("design:paramtypes", [])
], PacemInfiniteScrollComponent);
exports.PacemInfiniteScrollComponent = PacemInfiniteScrollComponent;
