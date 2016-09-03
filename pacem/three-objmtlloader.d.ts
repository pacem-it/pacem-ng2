/**
 * Loads a Wavefront .obj file with materials
 *
 */
export declare class OBJMTLLoader extends THREE.EventDispatcher {
    constructor(manager?: THREE.LoadingManager);
    private manager;
    crossOrigin: boolean;
    load(url: any, mtlurl: any, onLoad: any, onProgress: any, onError: any): void;
    /**
     * Parses loaded .obj file
     * @param data - content of .obj file
     * @param mtllibCallback - callback to handle mtllib declaration (optional)
     * @return {THREE.Object3D} - Object3D (with default material)
     */
    parse(data: any, mtllibCallback?: any): THREE.Group;
}
