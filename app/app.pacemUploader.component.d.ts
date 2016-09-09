import { PacemUploader } from './../pacem/pacem-ui';
import { Renderer, AfterViewInit } from '@angular/core';
export declare class PacemUploaderComponent implements AfterViewInit {
    private renderer;
    uploader: PacemUploader;
    private startUrl;
    private doUrl;
    private undoUrl;
    constructor(renderer: Renderer);
    private upload(dataUrl);
    ngAfterViewInit(): void;
    private complete(evt);
}
