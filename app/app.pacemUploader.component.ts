import { PacemUtils } from './../pacem/pacem-core';
import { PacemUploader, PacemSnapshot } from './../pacem/pacem-ui';
import { Component, Input, ViewChild, Renderer, AfterViewInit, ElementRef } from '@angular/core';

const baseUrl: string = 'uploader.ashx';

@Component({
    selector: 'app-pacem-uploader',
    template: `<h2 class="pacem-animatable">Pacem Uploader</h2>

<p class="pacem-animatable">Select a file from your storage and send it for upload.<br />
Just by selecting it, the upload process starts.</p>

<div style="position: relative; width: 108px; height: 108px;">
<pacem-ring-chart #chart>
    <pacem-ring-chart-item [value]="uploader.percentage"></pacem-ring-chart-item>
</pacem-ring-chart>
<form style="position: absolute; width: 32px; height: 32px; top: 50%; left: 50%; margin-top: -16px; margin-left: -16px" #form>
    <pacem-uploader [startUrl]="startUrl"
                    [uploadUrl]="doUrl" 
                    [undoUrl]="undoUrl" 
                    pattern="(jpg|png|pdf)$"
                    (complete)="complete($event)"
                    #uploader></pacem-uploader>
</form></div>
    <div [hidden]="!uploader.invalidFile">File non valido! ({{ uploader.pattern }})</div>

<h2 class="pacem-animatable">Pacem Snapshot</h2>
<p class="pacem-animatable">Pick a snapshot from you <b>webcam</b> and send it to the uploader</p>

<pacem-snapshot (select)="upload($event)">
Webcam access is <b>impossile</b> on this machine!
</pacem-snapshot>
<p class="pacem-animatable">The style provided along with the <i>snapshot</i> component automatically changes its size based on the status of the process.</p>
`,
    entryComponents: [PacemUploader, PacemSnapshot]
})
export class PacemUploaderComponent implements AfterViewInit {

    @ViewChild('uploader') uploader: PacemUploader;
    private startUrl: string = baseUrl + "?what=start";
    private doUrl: string = baseUrl + "?what=do";
    private undoUrl: string = baseUrl + "?what=undo";

    constructor(private renderer: Renderer) {
    }

    private upload(dataUrl: string) {
        const buffer = PacemUtils.dataURLToBlob(dataUrl);
        let f = new File([buffer], 'snapshot.jpg');
        this.uploader.upload(f);
    }
    
    ngAfterViewInit() {
    }

    private complete(evt) {
        console.info(JSON.stringify(evt));
    }
}