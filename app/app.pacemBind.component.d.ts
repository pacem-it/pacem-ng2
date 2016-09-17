import { PacemBindTarget, PacemBindService } from './../pacem/pacem-ui';
export declare class PacemBindComponent {
    private bindings;
    trigger: PacemBindTarget;
    constructor(bindings: PacemBindService);
    refresh(): void;
    private startPoint;
    private startPosition;
    private handle;
    private obj;
    private startDrag(evt);
    private drag(evt);
    private drop(evt);
}
