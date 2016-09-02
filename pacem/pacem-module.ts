import { NgModule} from '@angular/core';
//
import { Pacem3DModule } from './pacem-3d';
import { PacemCoreModule } from './pacem-core';
import { PacemUIModule } from './pacem-ui';
import { PacemMapsLeafletModule } from './pacem-maps-leaflet';
import { PacemNetModule } from './pacem-net';
import { PacemScaffoldingModule } from './pacem-scaffolding';

@NgModule({
    exports: [PacemCoreModule, PacemNetModule, Pacem3DModule, PacemUIModule, PacemMapsLeafletModule, PacemScaffoldingModule]
})
export class PacemModule {

}