import { OnInit } from '@angular/core';
import { PacemToast } from './../pacem/pacem-ui';
import { PacemHttp } from './../pacem/pacem-net';
export declare class PacemLightboxComponent implements OnInit {
    private http;
    private visible;
    private message;
    private size;
    private popped;
    toast: PacemToast;
    test(msg: any, evt: any): void;
    constructor(http: PacemHttp);
    ngOnInit(): void;
    addPic(evt: MouseEvent): void;
    removePic(evt: MouseEvent): void;
    private pictures;
}
