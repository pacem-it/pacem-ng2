import { PacemToast } from './../pacem/pacem-ui';
export declare class PacemLightboxComponent {
    private visible;
    private message;
    toast: PacemToast;
    test(msg: any, evt: any): void;
    addPic(evt: MouseEvent): void;
    removePic(evt: MouseEvent): void;
    private pictures;
}
