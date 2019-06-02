import * as THREE from 'three'
import {
    Direction,
    RecipesHaveFluidInput,
    RecipesHaveNoFluidOutput
} from './Blueprint'
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

// Note: the fraction parts of entities' positions must be .0 or .5, (i.e. have unique and finite decimal representation)
//       in order to draw connections of belts and pipes correctly.
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
    }

    get domElement() { return this._renderer.domElement; }

    _appendCategory(entities) {
        const categoryMap = {
            "transport-belt": "transport-belt",
            "fast-transport-belt": "transport-belt",
            "express-transport-belt": "transport-belt",
            "underground-belt": "underground-belt",
            "fast-underground-belt": "underground-belt",
            "express-underground-belt": "underground-belt",
            "splitter": "splitter",
            "fast-splitter": "splitter",
            "express-splitter": "splitter",
            "pipe": "pipe",
            "pipe-to-ground": "pipe-to-ground",
            "pump": "pump",
            "offshore-pump": "offshore-pump",
            "storage-tank": "storage-tank",
            "heat-pipe": "heat-pipe",
            "boiler": "boiler",
            "heat-exchanger": "boiler",
            "steam-engine": "steam-engine",
            "steam-turbine": "steam-engine",
            "nuclear-reactor": "nuclear-reactor",
            "assembling-machine-1": "assembling-machine",
            "assembling-machine-2": "assembling-machine",
            "assembling-machine-3": "assembling-machine",
            "chemical-plant": "chemical-plant",
            "oil-refinery": "oil-refinery",
            "straight-rail": "rail",
            "curved-rail": "rail",
            "rail-signal": "rail-signal",
            "rail-chain-signal": "rail-signal"
        };

        for (const entity of entities) {
            entity.category = categoryMap[entity.name];
        } 
    }

    _createConnectionFlags(entities) {
        const belt = {};
        const pipe = {};
        const heat = {};

        for (const entity of entities) {
            const d = entity.direction || 0;
            const x = entity.position.x;
            const y = entity.position.y;
            const t = entity.type;
            const c = entity.category;

            if (c === 'transport-belt') {
                let fromX = x;
                let fromY = y;
                let toX = x;
                let toY = y;
                switch (d) {
                    case Direction.UP:    ++fromY; --toY; break;
                    case Direction.RIGHT: --fromX; ++toX; break;
                    case Direction.DOWN:  --fromY; ++toY; break;
                    case Direction.LEFT:  ++fromX; --toX; break;
                    default: break;
                }
                const key = `${toX},${toY}`;
                const dircFlag = 1<<d;
                belt[key] = (belt[key] === undefined) ? dircFlag : (belt[key] | dircFlag);
            }
            else if (c === 'underground-belt') {
                let fromX = x;
                let fromY = y;
                let toX = x;
                let toY = y;
                switch (d) {
                    case Direction.UP:    ++fromY; --toY; break;
                    case Direction.RIGHT: --fromX; ++toX; break;
                    case Direction.DOWN:  --fromY; ++toY; break;
                    case Direction.LEFT:  ++fromX; --toX; break;
                    default: break;
                }
                if (t === 'output') {
                    const key = `${toX},${toY}`;
                    const dircFlag = 1<<d;
                    belt[key] = (belt[key] === undefined) ? dircFlag : (belt[key] | dircFlag);
                }
                else {
                    // TODO: check also input connections so that we can find terminal belts.

                }
            }
            else if (c === 'splitter') {
                let x0, y0, x1, y1;
                switch (d) {
                    case Direction.UP:
                        x0 = x-0.5; y0 = y-1.0; x1 = x+0.5; y1 = y-1.0; break;
                    case Direction.RIGHT:
                        x0 = x+1.0; y0 = y-0.5; x1 = x+1.0; y1 = y+0.5; break;
                    case Direction.DOWN:
                        x0 = x-0.5; y0 = y+1.0; x1 = x+0.5; y1 = y+1.0; break;
                    case Direction.LEFT:
                        x0 = x-1.0; y0 = y-0.5; x1 = x-1.0; y1 = y+0.5; break;
                    default:
                        break;
                }
                const key0 = `${x0},${y0}`;
                const key1 = `${x1},${y1}`;
                const dircFlag = 1<<d;
                belt[key0] = (belt[key0] === undefined) ? dircFlag : (belt[key0] | dircFlag);
                belt[key1] = (belt[key1] === undefined) ? dircFlag : (belt[key1] | dircFlag);

                // TODO: check also input connections so that we can find terminal belts.

            }
            else if (c === 'pipe') {
                for (const [index, delta] of [[0, -1], [1, 0], [0, 1], [-1, 0]].entries()) {
                    const key = `${x+delta[0]},${y+delta[1]}`;
                    const dircFlag = 1<<(2*index);
                    pipe[key] = (pipe[key] === undefined) ? dircFlag : (pipe[key] | dircFlag);
                }
            }
            else if (c === 'pipe-to-ground') {
                let key;
                switch (d) {
                    case Direction.UP:    key = `${x},${y-1}`; break;
                    case Direction.RIGHT: key = `${x+1},${y}`; break;
                    case Direction.DOWN:  key = `${x},${y+1}`; break;
                    case Direction.LEFT:  key = `${x-1},${y}`; break;
                    default: break;
                }
                const dircFlag = 1<<d;
                pipe[key] = (pipe[key] === undefined) ? dircFlag : (pipe[key] | dircFlag);
            }
            else if (c === 'pump') {
                let key0, key1;
                switch (d) {
                    case Direction.UP:    key0 = `${x},${y-1.5}`; key1 = `${x},${y+1.5}`; break;
                    case Direction.RIGHT: key0 = `${x+1.5},${y}`; key1 = `${x-1.5},${y}`; break;
                    case Direction.DOWN:  key0 = `${x},${y+1.5}`; key1 = `${x},${y-1.5}`; break;
                    case Direction.LEFT:  key0 = `${x-1.5},${y}`; key1 = `${x+1.5},${y}`; break;
                    default: break;
                }
                const inputDircFlag = 1<<((d+4)%8);
                const outputDircFlag = 1<<d;
                pipe[key0] = (pipe[key0] === undefined) ? outputDircFlag : (pipe[key0] | outputDircFlag);
                pipe[key1] = (pipe[key1] === undefined) ? inputDircFlag : (pipe[key1] | inputDircFlag);
            }
            else if (c === 'offshore-pump') {
                const flag = 1<<((d+4)%8);
                switch (d) {
                    case Direction.UP:
                        { const key = `${x  },${y+1}`; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    case Direction.RIGHT:
                        { const key = `${x-1},${y  }`; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    case Direction.DOWN:
                        { const key = `${x  },${y-1}`; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    case Direction.LEFT:
                        { const key = `${x+1},${y  }`; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    default:
                        break;
                }
            }
            else if (c === 'storage-tank') {
                switch (d) {
                    case Direction.UP:
                        { const key = `${x-1},${y-2}`; const flag = 1<<Direction.UP;    pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+2},${y+1}`; const flag = 1<<Direction.RIGHT; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+1},${y+2}`; const flag = 1<<Direction.DOWN;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-2},${y-1}`; const flag = 1<<Direction.LEFT;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    case Direction.RIGHT:
                        { const key = `${x+1},${y-2}`; const flag = 1<<Direction.UP;    pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+2},${y-1}`; const flag = 1<<Direction.RIGHT; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-1},${y+2}`; const flag = 1<<Direction.DOWN;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-2},${y+1}`; const flag = 1<<Direction.LEFT;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    default: break;
                }
            }
            else if (c === 'assembling-machine') {
                if (RecipesHaveFluidInput.includes(entity.recipe)) {
                    let key;
                    switch (d) {
                        case Direction.UP:    key = `${x},${y-2}`; break;
                        case Direction.RIGHT: key = `${x+2},${y}`; break;
                        case Direction.DOWN:  key = `${x},${y+2}`; break;
                        case Direction.LEFT:  key = `${x-2},${y}`; break;
                        default: break;
                    }
                    const dircFlag = 1<<d;
                    pipe[key] = (pipe[key] === undefined) ? dircFlag : (pipe[key] | dircFlag);
                }
            }
            else if (c === 'chemical-plant') {
                let inputDelta, outputDelta;
                switch (d) {
                    case Direction.UP:
                        inputDelta = [-1, -2, 1, -2];
                        outputDelta = [-1, 2, 1, 2];
                        break;
                    case Direction.RIGHT:
                        inputDelta = [2, -1, 2, 1];
                        outputDelta = [-2, -1, -2, 1];
                        break;
                    case Direction.DOWN:
                        inputDelta = [-1, 2, 1, 2];
                        outputDelta = [-1, -2, 1, -2];
                        break;
                    case Direction.LEFT:
                        inputDelta = [-2, -1, -2, 1];
                        outputDelta = [2, -1, 2, 1];
                        break;
                    default:
                        break;
                }

                const inputDircFlag = 1<<d;
                for (let i = 0; i < 4; i+=2) {
                    const key = `${x+inputDelta[i]},${y+inputDelta[i+1]}`;
                    pipe[key] = (pipe[key] === undefined) ? inputDircFlag : (pipe[key] | inputDircFlag);
                }

                if (!RecipesHaveNoFluidOutput.includes(entity.recipe)) {
                    const outputDircFlag = 1<<((d+4)%8);
                    for (let i = 0; i < 4; i+=2) {
                        const key = `${x+outputDelta[i]},${y+outputDelta[i+1]}`;
                        pipe[key] = (pipe[key] === undefined) ? outputDircFlag : (pipe[key] | outputDircFlag);
                    }
                }
            }
            else if (c === 'oil-refinery') {
                let inputDelta, outputDelta;
                switch (d) {
                    case Direction.UP:
                        inputDelta = [1, 3, -1, 3];
                        outputDelta = [2, -3, 0, -3, -2, -3];
                        break;
                    case Direction.RIGHT:
                        inputDelta = [-3, 1, -3, -1];
                        outputDelta = [3, 2, 3, 0, 3, -2];
                        break;
                    case Direction.DOWN:
                        inputDelta = [-1, -3, 1, -3];
                        outputDelta = [-2, 3, 0, 3, 2, 3];
                        break;
                    case Direction.LEFT:
                        inputDelta = [3, -1, 3, 1];
                        outputDelta = [-3, -2, -3, 0, -3, 2];
                        break;
                    default:
                        break;
                }

                const inputDircFlag = 1<<((d+4)%8);
                for (let i = 0; i < 4; i+=2) {
                    const key = `${x+inputDelta[i]},${y+inputDelta[i+1]}`;
                    pipe[key] = (pipe[key] === undefined) ? inputDircFlag : (pipe[key] | inputDircFlag);
                }

                const outputDircFlag = 1<<d;
                for (let i = 0; i < 6; i+=2) {
                    const key = `${x+outputDelta[i]},${y+outputDelta[i+1]}`;
                    pipe[key] = (pipe[key] === undefined) ? outputDircFlag : (pipe[key] | outputDircFlag);
                }
            }
            else if (c === 'heat-pipe') {
                for (const [index, delta] of [[0, -1], [1, 0], [0, 1], [-1, 0]].entries()) {
                    const key = `${x+delta[0]},${y+delta[1]}`;
                    const dircFlag = 1<<(2*index);
                    heat[key] = (heat[key] === undefined) ? dircFlag : (heat[key] | dircFlag);
                }
            }
            else if (c === 'boiler') {
                switch (d) {
                    case Direction.UP:
                        { const key = `${x    },${y-1.5}`; const flag = 1<<Direction.UP;    pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-2  },${y+0.5}`; const flag = 1<<Direction.LEFT;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+2  },${y+0.5}`; const flag = 1<<Direction.RIGHT; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x    },${y+1.5}`; const flag = 1<<Direction.DOWN;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                        break;
                    case Direction.RIGHT:
                        { const key = `${x+1.5},${y    }`; const flag = 1<<Direction.RIGHT; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-0.5},${y-2  }`; const flag = 1<<Direction.UP;    pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-0.5},${y+2  }`; const flag = 1<<Direction.DOWN;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-1.5},${y    }`; const flag = 1<<Direction.LEFT;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                        break;
                    case Direction.DOWN:
                        { const key = `${x    },${y+1.5}`; const flag = 1<<Direction.DOWN;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+2  },${y-0.5}`; const flag = 1<<Direction.RIGHT; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x-2  },${y-0.5}`; const flag = 1<<Direction.LEFT;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x    },${y-1.5}`; const flag = 1<<Direction.UP;    heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                        break;
                    case Direction.LEFT:
                        { const key = `${x-1.5},${y    }`; const flag = 1<<Direction.LEFT;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+0.5},${y+2  }`; const flag = 1<<Direction.DOWN;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+0.5},${y-2  }`; const flag = 1<<Direction.UP;    pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+1.5},${y    }`; const flag = 1<<Direction.RIGHT; heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                        break;
                    default:
                        break;
                }
            }
            else if (c === 'steam-engine') {
                switch (d) {
                    case Direction.UP:
                        { const key = `${x},${y-3}`; const flag = 1<<Direction.UP;    pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x},${y+3}`; const flag = 1<<Direction.DOWN;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    case Direction.RIGHT:
                        { const key = `${x-3},${y}`; const flag = 1<<Direction.LEFT;  pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        { const key = `${x+3},${y}`; const flag = 1<<Direction.RIGHT; pipe[key] = (pipe[key] === undefined) ? flag : (pipe[key] | flag); }
                        break;
                    default:
                        break;
                }
            }
            else if (c === 'nuclear-reactor') {
                { const key = `${x-2},${y-3}`; const flag = 1<<Direction.UP;    heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x  },${y-3}`; const flag = 1<<Direction.UP;    heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x+2},${y-3}`; const flag = 1<<Direction.UP;    heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x+3},${y-2}`; const flag = 1<<Direction.RIGHT; heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x+3},${y  }`; const flag = 1<<Direction.RIGHT; heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x+3},${y+2}`; const flag = 1<<Direction.RIGHT; heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x-2},${y+3}`; const flag = 1<<Direction.DOWN;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x  },${y+3}`; const flag = 1<<Direction.DOWN;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x+2},${y+3}`; const flag = 1<<Direction.DOWN;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x-3},${y-2}`; const flag = 1<<Direction.LEFT;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x-3},${y  }`; const flag = 1<<Direction.LEFT;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
                { const key = `${x-3},${y+2}`; const flag = 1<<Direction.LEFT;  heat[key] = (heat[key] === undefined) ? flag : (heat[key] | flag); }
            }
        }

        return { belt, pipe, heat };
    }

    _createEntities(entities, connectionFlags) {
        const ret = new THREE.Group();
        ret.scale.y = -1.0;

        for (const entity of entities) {
            const n = entity.name;
            const d = entity.direction || 0;
            const x = entity.position.x;
            const y = entity.position.y;
            const t = entity.type;

            const option = (d&1) === 1;
            const rotationFactor = d>>1;

            let flipHorizontal = false;
            let rotation = 0.5 * Math.PI * rotationFactor;

            if (entity.category === 'transport-belt') {
                const key = `${x},${y}`;
                entity.connection_flags_belt = connectionFlags.belt[key];
            }
            else if (entity.category === 'pipe') {
                const key = `${x},${y}`;
                entity.connection_flags_pipe = connectionFlags.pipe[key];

                // if the pipe has less than two connections, add missing ones.
                if     (!entity.connection_flags_pipe)        entity.connection_flags_pipe = 70; // horizontal straight pipe.
                else if (entity.connection_flags_pipe ===  1) entity.connection_flags_pipe = 17; // vertical straight pipe.
                else if (entity.connection_flags_pipe === 16) entity.connection_flags_pipe = 17;
                else if (entity.connection_flags_pipe ===  4) entity.connection_flags_pipe = 70;
                else if (entity.connection_flags_pipe === 64) entity.connection_flags_pipe = 70;
            }
            else if (entity.category === 'heat-pipe') {
                const key = `${x},${y}`;
                entity.connection_flags_heat = connectionFlags.heat[key];

                if     (!entity.connection_flags_heat)        entity.connection_flags_heat = 70;
                else if (entity.connection_flags_heat ===  1) entity.connection_flags_heat = 17;
                else if (entity.connection_flags_heat === 16) entity.connection_flags_heat = 17;
                else if (entity.connection_flags_heat ===  4) entity.connection_flags_heat = 70;
                else if (entity.connection_flags_heat === 64) entity.connection_flags_heat = 70;
            }
            else if (entity.category === 'rail') {
                flipHorizontal = option;
            }
            else if (entity.category === 'rail-signal') {
                rotation += option ? 0.25*Math.PI : 0.0;
            }

            const geometry = this._geometryFactory.create(entity);
            const obj = new THREE.LineSegments(geometry, this._commonMaterial);
            obj.position.set(x, y, 0);
            obj.scale.x = flipHorizontal ? -1.0 : 1.0;
            obj.rotation.z = rotation;

            ret.add(obj);
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

        this._appendCategory(blueprint.entities);
        const conns = this._createConnectionFlags(blueprint.entities);
        const entityRoot = this._createEntities(blueprint.entities, conns);

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
