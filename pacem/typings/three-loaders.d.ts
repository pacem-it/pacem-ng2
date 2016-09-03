declare namespace THREE {

    export class OBJLoader extends EventDispatcher {
        constructor(manager?: THREE.LoadingManager);
        setMaterials(materials: Material[]): void;
        materials: Material[];
        setPath(value: string): void;
        load(url: string, onLoad?: (response: any) => any, onProgress?: (response: any) => any, onError?: (response: any) => any): void;
        parse(text: string): Object3D;
    }

    export class MTLLoader extends EventDispatcher {
        constructor(manager?: THREE.LoadingManager);
        /**
	     * Loads and parses a MTL asset from a URL.
	     *
	     * @param {String} url - URL to the MTL file.
	     * @param {Function} [onLoad] - Callback invoked with the loaded object.
	     * @param {Function} [onProgress] - Callback for download progress.
	     * @param {Function} [onError] - Callback for download errors.
	     *
	     * @see setPath setTexturePath
	     *
	     * @note In order for relative texture references to resolve correctly
	     * you must call setPath and/or setTexturePath explicitly prior to load.
	     */
        load(url: string, onLoad?: (response: MaterialCreator) => any, onProgress?: (response: any) => any, onError?: (response: any) => any): void;
        /**
	     * Set base path for resolving references.
	     * If set this path will be prepended to each loaded and found reference.
	     *
	     * @see setTexturePath
	     * @param {String} path
	     *
	     * @example
	     *     mtlLoader.setPath( 'assets/obj/' );
	     *     mtlLoader.load( 'my.mtl', ... );
	     */
        setPath(path: string);
        /**
	     * Set base path for resolving texture references.
	     * If set this path will be prepended found texture reference.
	     * If not set and setPath is, it will be used as texture base path.
	     *
	     * @see setPath
	     * @param {String} path
	     *
	     * @example
	     *     mtlLoader.setPath( 'assets/obj/' );
	     *     mtlLoader.setTexturePath( 'assets/textures/' );
	     *     mtlLoader.load( 'my.mtl', ... );
	     */
        setTexturePath(path: string);
        setBaseUrl(path: string);
        setMaterialOptions(value: THREE.MaterialParameters);
        setCrossOrigin(value: any);
        /**
	     * Parses a MTL file.
	     *
	     * @param {String} text - Content of MTL file
	     * @return {THREE.MTLLoader.MaterialCreator}
	     *
	     * @see setPath setTexturePath
	     *
	     * @note In order for relative texture references to resolve correctly
	     * you must call setPath and/or setTexturePath explicitly prior to parse.
	     */
        parse(text: string): MaterialCreator;
    }

    class MaterialCreator {
        /**
         * Create a new THREE-MTLLoader.MaterialCreator
         * @param baseUrl - Url relative to which textures are loaded
         * @param options - Set of options on how to construct the materials
         *                  side: Which side to apply the material
         *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
         *                  wrap: What type of wrapping to apply for textures
         *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
         *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
         *                                Default: false, assumed to be already normalized
         *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
         *                                  Default: false
         * @constructor
         */
        constructor(baseUrl: string, options);

        setCrossOrigin(value: any): void;

        setManager(value: LoadingManager): void;

        setMaterials(materialsInfo): void;

        convert(materialsInfo: MaterialParameters);

        preload();

        getIndex(materialName: string): number;

        getAsArray(): Material[];

        create(materialName: string): Material;

        getTextureParams(value: any, matParams: MaterialParameters): any;

        loadTexture(url: string, mapping: any, onLoad?: (response: any) => any, onProgress?: (response: any) => any, onError?: (response: any) => any): void;
    }
}
