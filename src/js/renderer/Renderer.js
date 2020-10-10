import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls'
import { ConnectionSolver } from 'renderer/ConnectionSolver'
import { GeometryFactory } from 'renderer/GeometryFactory'

class Grid extends THREE.Group {
    constructor(layer = 0) {
        super();

        this._materialBody = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2
        });

        this._materialEdge = new THREE.LineBasicMaterial({
            color: 0xffffff
        });

        this._layer = layer;
    }

    clear() {
        while (this.children.length > 0) {
            const child = this.children[0];

            this.remove(child);

            child.geometry.dispose();
            child.material.dispose();
        }
    }

    update(width, height) {
        this.clear();

        width = Math.ceil(width);
        height = Math.ceil(height);

        const w2 = width/2;
        const h2 = height/2;

        {
            // body.
            const vertices = [];

            for (let i = 1; i < height; i++) {
                vertices.push(-w2, -h2+i, 0, w2, -h2+i, 0);
            }
            for (let i = 1; i < width; i++) {
                vertices.push(-w2+i, -h2, 0, -w2+i, h2, 0);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

            const obj = new THREE.LineSegments(geometry, this._materialBody);
            obj.layers.set(this._layer);

            this.add(obj);
        }

        {
            // edge.
            const vertices = [-w2, -h2, 0, -w2, h2, 0, w2, h2, 0, w2, -h2, 0];
            const indices = [0, 1, 1, 2, 2, 3, 3, 0];

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

            const obj = new THREE.LineSegments(geometry, this._materialEdge);
            obj.layers.set(this._layer);

            this.add(obj);
        }
    }

    setColor(color) {
        this._materialBody.color.set(color);
        this._materialEdge.color.set(color);
    }
}

const LAYER_MAIN = 0;
const LAYER_ICON = 1;
const LAYER_GRID = 2;

export class Renderer {
    constructor() {
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setPixelRatio(window.devicePixelRatio);

        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
        this._camera.up = new THREE.Vector3(0, 0, 1);
        this._camera.position.z = 1000;
        this._camera.layers.enableAll();

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x0170c1);

        this._commonMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff
        });

        this._blueprintBody = new THREE.Group();
        this._scene.add(this._blueprintBody);

        this._grid = new Grid(LAYER_GRID);
        this._scene.add(this._grid);

        this._iconGroup = null;

        this._controls = new MapControls(this._camera, this._renderer.domElement);
        this._controls.zoomSpeed = 2.0;
        this._controls.minZoom = 0.5;
        this._controls.maxZoom = 8.0;
        this._controls.maxPolarAngle = 1.5;
        this._controls.screenSpacePanning = true;
        this._renderer.domElement.addEventListener('pointerup', (e) => {
            if (e.button === 1) {
                this._controls.reset();
            }
        });

        this._geometryFactory = new GeometryFactory();
        this._connectionSolver = new ConnectionSolver();

        this._offscreenRenderer = new THREE.WebGLRenderer({ antialias: true });
        this._offscreenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
        this._offscreenCamera.position.z = 1000;
    }

    get domElement() { return this._renderer.domElement; }

    _createEntities(entities) {
        const root = new THREE.Group();
        root.scale.y = -1.0;

        this._connectionSolver.init(entities);

        const entityGeometries = [];
        const iconGeometries = [];

        for (const entity of entities) {
            const n = entity.name;
            const d = entity.direction || 0;
            const o = entity.orientation ? 4*entity.orientation : null;

            const conn = this._connectionSolver.getConnectionFlags(entity);
            const option = (d&1) === 1;
            const rotationFactor = (o!==null) ? o : d>>1;

            let flipHorizontal = false;
            let rotation = 0.5 * Math.PI * rotationFactor;

            if (n === 'curved-rail') {
                flipHorizontal = option;
            }
            else if (n === 'rail-signal' || n === 'rail-chain-signal') {
                rotation += option ? 0.25*Math.PI : 0.0;
            }

            {
                const g = this._geometryFactory.create(entity, conn, false);
                if (g != null) {
                    g.scale(flipHorizontal ? -1.0 : 1.0, 1.0, 1.0);
                    g.rotateZ(rotation);
                    g.translate(entity.position.x, entity.position.y, 0);
                    entityGeometries.push(g);
                }
            }

            {
                const g = this._geometryFactory.createIcon(entity, conn, false);
                if (g !== null) {
                    g.translate(entity.position.x, entity.position.y, 0);
                    iconGeometries.push(g);
                }
            }
        }

        if (entityGeometries.length > 0) {
            const g = BufferGeometryUtils.mergeBufferGeometries(entityGeometries);
            const m = new THREE.LineSegments(g, this._commonMaterial);
            root.add(m);
        }

        if (iconGeometries.length > 0) {
            const g = BufferGeometryUtils.mergeBufferGeometries(iconGeometries);
            const m = new THREE.LineSegments(g, this._commonMaterial);
            m.layers.set(LAYER_ICON);
            root.add(m);
        }

        return root;
    }

    _adjustFrame(content, margin=4) {
        const b = new THREE.Box3();
        const v = new THREE.Vector3();

        b.setFromObject(content);

        const center = b.getCenter(v).multiplyScalar(2).round().multiplyScalar(0.5);
        content.translateX(-center.x).translateY(-center.y);

        const size = b.getSize(v).addScalar(margin);
        this._grid.update(size.x, size.y);
    }

    setBlueprint(blueprint) {
        const b = this._blueprintBody;

        while (b.children.length > 0) {
            b.remove(b.children[0]);
        }

        if (blueprint.entities === undefined) {
            return;
        }

        const root = this._createEntities(blueprint.entities);

        b.add(root);

        this._adjustFrame(b);
    }

    setBackgroundColor(color) {
        this._scene.background.set(color);
    }

    setLineColor(color) {
        this._commonMaterial.color.set(color);
        this._grid.setColor(color);
    }

    setIconsVisibility(visible) {
        if (visible) {
            this._camera.layers.enable(LAYER_ICON);
        }
        else {
            this._camera.layers.disable(LAYER_ICON);
        }
    }

    setSize(width, height) {
        this._renderer.setSize(width, height);

        const c = this._camera;
        const h = 100;
        const w = h * width / height;

        c.left = -w/2;
        c.right = w/2;
        c.bottom = -h/2;
        c.top = h/2;
        c.updateProjectionMatrix();
    }

    update() {

    }

    render() {
        this._renderer.render(this._scene, this._camera);
    }

    renderToImage(scale = 10.0, margin = 1.0, maxSide = 0) {
        const bbox = new THREE.Box3().setFromObject(this._scene);

        const l = bbox.min.x - margin;
        const r = bbox.max.x + margin;
        const b = bbox.min.y - margin;
        const t = bbox.max.y + margin;

        const s = (maxSide > 0) ? (Math.min(Math.min(maxSide / (r - l), maxSide / (t - b)), scale)) : scale;

        const w = Math.round((r - l) * s);
        const h = Math.round((t - b) * s);

        this._offscreenRenderer.setSize(w, h);

        this._offscreenCamera.left = l;
        this._offscreenCamera.right = r;
        this._offscreenCamera.bottom = b;
        this._offscreenCamera.top = t;
        this._offscreenCamera.updateProjectionMatrix();

        this._offscreenCamera.layers.mask = this._camera.layers.mask;

        this._offscreenRenderer.render(this._scene, this._offscreenCamera);

        return this._offscreenRenderer.domElement;
    }
}
