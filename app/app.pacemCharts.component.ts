import { PacemRingChart, PacemRingChartItem, PacemPieChart, PacemPieChartSlice } from './../pacem/pacem-ui';
import { Component, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'app-pacem-charts',
    template: `<h2>Pacem Charts</h2>

<p>Modify the inputs and see the triple-folded chart updating live.</p>

    <pacem-ring-chart>
        <pacem-ring-chart-item [value]="value1"></pacem-ring-chart-item>
        <pacem-ring-chart-item [value]="value2"></pacem-ring-chart-item>
        <pacem-ring-chart-item [value]="value3"></pacem-ring-chart-item>
        <pacem-ring-chart-item [value]="value4"></pacem-ring-chart-item>
    </pacem-ring-chart>

<p>The following chart allow interaction in order to modify the value "graphically".</p>

    <pacem-ring-chart>
        <pacem-ring-chart-item [(value)]="value4" interactive="true" round="0"></pacem-ring-chart-item>
    </pacem-ring-chart>

<p>Same input values trigger the redraw of the following pie-chart as well.</p>

    <pacem-pie-chart>
        <pacem-pie-chart-slice [value]="value1"></pacem-pie-chart-slice>
        <pacem-pie-chart-slice [value]="value2"></pacem-pie-chart-slice>
        <pacem-pie-chart-slice [value]="value3"></pacem-pie-chart-slice>
        <pacem-pie-chart-slice [value]="value4"></pacem-pie-chart-slice>
    </pacem-pie-chart>
    
    <ol style="margin-top: 1em" class="pacem-field">
    <li class="pacem-input-container"><input class="pacem-input" type="number" required [(ngModel)]="value1" max="100" min="0" /></li>
    <li class="pacem-input-container"><input class="pacem-input" type="number" required [(ngModel)]="value2" max="100" min="0" /></li>
    <li class="pacem-input-container"><input class="pacem-input" type="number" required [(ngModel)]="value3" max="100" min="0" /></li>
    <li class="pacem-input-container"><input class="pacem-input" type="number" required [(ngModel)]="value4" max="100" min="0" /></li>
</ol>
`/*,
    entryComponents: [PacemRingChart, PacemRingChartItem, PacemPieChart]*/
})
export class PacemChartsComponent {
    
    private value1: number = 50.0;
    private value2: number = 25.0;
    private value3: number = 75.0;
    private value4: number = 50.0;
}