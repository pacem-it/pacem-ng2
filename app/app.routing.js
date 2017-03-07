"use strict";
var router_1 = require("@angular/router");
var app_404_component_1 = require("./app.404.component");
var app_perf_component_1 = require("./app.perf.component");
var app_pacemMap_component_1 = require("./app.pacemMap.component");
var app_pacemInfiniteScroll_component_1 = require("./app.pacemInfiniteScroll.component");
var app_pacemLightbox_component_1 = require("./app.pacemLightbox.component");
var app_pacemBalloon_component_1 = require("./app.pacemBalloon.component");
var app_pacemUploader_component_1 = require("./app.pacemUploader.component");
var app_pacemCharts_component_1 = require("./app.pacemCharts.component");
var app_pacemScaffolding_component_1 = require("./app.pacemScaffolding.component");
var app_pacem3D_component_1 = require("./app.pacem3D.component");
var app_pacemBind_component_1 = require("./app.pacemBind.component");
var app_pacemNet_component_1 = require("./app.pacemNet.component");
exports.pages = [
    { label: 'performances', component: app_perf_component_1.PerfComponent },
    { label: 'networking', component: app_pacemNet_component_1.PacemNetComponent },
    { label: 'map (leafletJS)', component: app_pacemMap_component_1.PacemMapComponent },
    { label: 'infinite scroll', component: app_pacemInfiniteScroll_component_1.PacemInfiniteScrollComponent },
    { label: 'lightbox', component: app_pacemLightbox_component_1.PacemLightboxComponent },
    { label: 'balloon', component: app_pacemBalloon_component_1.PacemBalloonComponent },
    { label: 'uploader', component: app_pacemUploader_component_1.PacemUploaderComponent },
    { label: 'charts', component: app_pacemCharts_component_1.PacemChartsComponent },
    //{ label: 'calendar', component: PacemCalendarComponent },
    { label: 'scaffolding', component: app_pacemScaffolding_component_1.PacemScaffoldingComponent },
    { label: '3D', component: app_pacem3D_component_1.Pacem3DComponent },
    { label: 'binds', component: app_pacemBind_component_1.PacemBindComponent }
];
var appRoutes = exports.pages.map(function (cmp) { return { path: 'pacem/' + cmp.component.name, component: cmp.component }; })
    .concat([{ path: '**', component: app_404_component_1.PageNotFoundComponent }]);
exports.routing = router_1.RouterModule.forRoot(appRoutes, { useHash: false });
