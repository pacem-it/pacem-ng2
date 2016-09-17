import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './app.404.component';
import { PacemMapComponent } from './app.pacemMap.component';
import { PacemInfiniteScrollComponent } from './app.pacemInfiniteScroll.component';
import { PacemLightboxComponent } from './app.pacemLightbox.component';
import { PacemBalloonComponent } from './app.pacemBalloon.component';
import { PacemUploaderComponent } from './app.pacemUploader.component';
import { PacemChartsComponent } from './app.pacemCharts.component';
import { PacemScaffoldingComponent } from './app.pacemScaffolding.component';
import { Pacem3DComponent } from './app.pacem3D.component';
import { PacemBindComponent } from './app.pacemBind.component';
import { PacemNetComponent } from './app.pacemNet.component';
import { PacemCalendarComponent } from './app.pacemCalendar.component';
import { Type, ModuleWithProviders } from '@angular/core';

export const pages: { label: string, component: Type<any> }[] = [
    { label: 'networking', component: PacemNetComponent },
    { label: 'map (leafletJS)', component: PacemMapComponent },
    { label: 'infinite scroll', component: PacemInfiniteScrollComponent },
    { label: 'lightbox', component: PacemLightboxComponent },
    { label: 'balloon', component: PacemBalloonComponent },
    { label: 'uploader', component: PacemUploaderComponent },
    { label: 'charts', component: PacemChartsComponent },
    { label: 'calendar', component: PacemCalendarComponent },
    { label: 'scaffolding', component: PacemScaffoldingComponent },
    { label: '3D', component: Pacem3DComponent },
    { label: 'binds', component: PacemBindComponent }
];
const appRoutes: Routes = pages.map((cmp) => { return { path: 'pacem/' + cmp.component.name, component: cmp.component }; })
    .concat([{ path: '**', component: PageNotFoundComponent }]);

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, { useHash: false });