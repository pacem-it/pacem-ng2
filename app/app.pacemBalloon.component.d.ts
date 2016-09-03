import { ElementRef, OnInit } from '@angular/core';
export declare class PacemBalloonComponent implements OnInit {
    balloon1: ElementRef;
    balloon2: ElementRef;
    ngOnInit(): void;
    private balloonName;
    balloon: HTMLElement;
    model: {
        position: string;
        trigger: string;
        behavior: string;
    };
}
