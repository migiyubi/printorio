import * as THREE from 'three'
import {
    Direction,
    RecipesHaveFluidInput,
    RecipesHaveNoFluidOutput
} from './Blueprint'
import { ConnectionSolver } from './ConnectionSolver'
import { GeometryFactory } from './GeometryFactory'
import { MapControls } from './MapControls'

class Grid extends THREE.Group {
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
            geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2
            });

            const obj = new THREE.LineSegments(geometry, material);

            this.add(obj);
        }

        {
            // edge.
            const vertices = [-w2, -h2, 0, -w2, h2, 0, w2, h2, 0, w2, -h2, 0];
            const indices = [0, 1, 1, 2, 2, 3, 3, 0];

            const geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

            const material = new THREE.LineBasicMaterial({
                color: 0xffffff
            });

            const obj = new THREE.LineSegments(geometry, material);

            this.add(obj);
        }
    }
}

export default class Renderer {
    constructor() {
        this._renderer = new THREE.WebGLRenderer({ antialias: true });

        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
        this._camera.up = new THREE.Vector3(0, 0, 1);
        this._camera.position.z = 1000;

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x0170c1);

        this._commonMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff
        });

        this._blueprintBody = new THREE.Group();
        this._scene.add(this._blueprintBody);

        this._grid = new Grid();
        this._scene.add(this._grid);

        this._controls = new MapControls(this._camera, this._renderer.domElement);
        this._controls.zoomSpeed = 2.0;
        this._controls.minZoom = 0.5;
        this._controls.maxZoom = 8.0;
        this._controls.maxPolarAngle = 1.5;
        this._controls.screenSpacePanning = false;
        this._renderer.domElement.addEventListener('mouseup', (e) => {
            if (e.button === 1) {
                this._controls.reset();
            }
        });

        this._geometryFactory = new GeometryFactory();
        this._connectionSolver = new ConnectionSolver();
    }

    get domElement() { return this._renderer.domElement; }

    _createEntities(entities) {
        const ret = new THREE.Group();
        ret.scale.y = -1.0;

        const entitiyGroup = new THREE.Group();
        const iconGroup = new THREE.Group();
        ret.add(entitiyGroup);
        ret.add(iconGroup);

        this._connectionSolver.init(entities);

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

            const geometry = this._geometryFactory.create(entity, conn);
            const obj = new THREE.LineSegments(geometry, this._commonMaterial);
            obj.position.set(entity.position.x, entity.position.y, 0);
            obj.scale.x = flipHorizontal ? -1.0 : 1.0;
            obj.rotation.z = rotation;
            entitiyGroup.add(obj);

            const iconGeometry = this._geometryFactory.createIcon(entity, conn);
            if (iconGeometry !== null) {
                const icon = new THREE.LineSegments(iconGeometry, this._commonMaterial);
                icon.position.set(entity.position.x, entity.position.y, 0);
                iconGroup.add(icon);
            }
        }

        return ret;
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

        const entityRoot = this._createEntities(blueprint.entities);

        b.add(entityRoot);

        this._adjustFrame(b);
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
}
