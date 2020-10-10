import {
    Direction,
    RecipesHaveFluidInput,
    RecipesHaveNoFluidOutput
} from '../Blueprint'

export const ConnectionEquivalentDict = {
    "transport-belt": "transport-belt",
    "fast-transport-belt": "transport-belt",
    "express-transport-belt": "transport-belt",
    "underground-belt": "underground-belt",
    "fast-underground-belt": "underground-belt",
    "express-underground-belt": "underground-belt",
    "splitter": "splitter",
    "fast-splitter": "splitter",
    "express-splitter": "splitter",
    "heat-exchanger": "boiler",
    "steam-turbine": "steam-engine",
    "assembling-machine-1": "assembling-machine",
    "assembling-machine-2": "assembling-machine",
    "assembling-machine-3": "assembling-machine",
};

export class ConnectionSolver {
    // OPTIMIZE: inlining?
    _toUniqueKey(x, y) {
        return (Math.round(y) + 32768) * 65536 + (Math.round(x) + 32768);
    }

    // OPTIMIZE: inlining?
    _setFlag(map, x, y, entityDirection, dx, dy, connectionDirectionOffset) {
        switch (entityDirection) {
            case Direction.UP:    x += dx; y += dy; break;
            case Direction.RIGHT: x -= dy; y += dx; break;
            case Direction.DOWN:  x -= dx; y -= dy; break;
            case Direction.LEFT:  x += dy; y -= dx; break;
            default: break;
        }

        const connDirc = (entityDirection + connectionDirectionOffset) % 8;
        const key = this._toUniqueKey(x, y);
        const flag = 1<<connDirc;
        map[key] = (map[key] === undefined) ? flag : (map[key] | flag);
    }

    init(entities) {
        this._connFlagsBelt = {};
        this._connFlagsPipe = {};
        this._connFlagsHeat = {};
        this._connFlagsWall = {};
        const belt = this._connFlagsBelt;
        const pipe = this._connFlagsPipe;
        const heat = this._connFlagsHeat;
        const wall = this._connFlagsWall;

        for (const entity of entities) {
            const d = entity.direction || 0;
            const x = entity.position.x;
            const y = entity.position.y;
            const t = entity.type;
            const c = ConnectionEquivalentDict[entity.name] || entity.name;

            if (c === 'transport-belt') {
                this._setFlag(belt, x, y, d, 0, -1, 0);
            }
            else if (c === 'underground-belt') {
                if (t === 'output') {
                    this._setFlag(belt, x, y, d, 0, -1, 0);
                }
                else {
                    // TODO: check also input connections so that we can find terminal belts.

                }
            }
            else if (c === 'splitter') {
                this._setFlag(belt, x, y, d, -0.5, -1, 0);
                this._setFlag(belt, x, y, d,  0.5, -1, 0);

                // TODO: check also input connections so that we can find terminal belts.

            }
            else if (c === 'pipe') {
                this._setFlag(pipe, x, y, d,  0, -1, 0);
                this._setFlag(pipe, x, y, d,  1,  0, 2);
                this._setFlag(pipe, x, y, d,  0,  1, 4);
                this._setFlag(pipe, x, y, d, -1,  0, 6);
            }
            else if (c === 'pipe-to-ground') {
                this._setFlag(pipe, x, y, d,  0, -1, 0);
            }
            else if (c === 'pump') {
                this._setFlag(pipe, x, y, d,  0, -1.5, 0);
                this._setFlag(pipe, x, y, d,  0,  1.5, 4);
            }
            else if (c === 'offshore-pump') {
                this._setFlag(pipe, x, y, d, 0, 1, 4);
            }
            else if (c === 'storage-tank') {
                this._setFlag(pipe, x, y, d, -1, -2, 0);
                this._setFlag(pipe, x, y, d,  2,  1, 2);
                this._setFlag(pipe, x, y, d,  1,  2, 4);
                this._setFlag(pipe, x, y, d, -2, -1, 6);
            }
            else if (c === 'assembling-machine') {
                if (RecipesHaveFluidInput.includes(entity.recipe)) {
                    this._setFlag(pipe, x, y, d, 0, -2, 0);
                }
            }
            else if (c === 'chemical-plant') {
                // inputs.
                this._setFlag(pipe, x, y, d, -1, -2, 0);
                this._setFlag(pipe, x, y, d,  1, -2, 0);

                // outputs.
                if (!RecipesHaveNoFluidOutput.includes(entity.recipe)) {
                    this._setFlag(pipe, x, y, d, -1,  2, 4);
                    this._setFlag(pipe, x, y, d,  1,  2, 4);
                }
            }
            else if (c === 'oil-refinery') {
                this._setFlag(pipe, x, y, d,  2, -3, 0);
                this._setFlag(pipe, x, y, d,  0, -3, 0);
                this._setFlag(pipe, x, y, d, -2, -3, 0);
                this._setFlag(pipe, x, y, d,  1,  3, 4);
                this._setFlag(pipe, x, y, d, -1,  3, 4);

                // TODO: basic oil processing now has less ports.

            }
            else if (c === 'heat-pipe') {
                this._setFlag(heat, x, y, d,  0, -1, 0);
                this._setFlag(heat, x, y, d,  1,  0, 2);
                this._setFlag(heat, x, y, d,  0,  1, 4);
                this._setFlag(heat, x, y, d, -1,  0, 6);
            }
            else if (c === 'boiler') {
                this._setFlag(pipe, x, y, d,  0, -1.5, 0);
                this._setFlag(pipe, x, y, d,  2,  0.5, 2);
                this._setFlag(pipe, x, y, d, -2,  0.5, 6);
                this._setFlag(heat, x, y, d,  0,  1.5, 4);
            }
            else if (c === 'steam-engine') {
                this._setFlag(pipe, x, y, d, 0, -3, 0);
                this._setFlag(pipe, x, y, d, 0,  3, 4);
            }
            else if (c === 'nuclear-reactor') {
                this._setFlag(heat, x, y, d, -2, -3, 0);
                this._setFlag(heat, x, y, d,  0, -3, 0);
                this._setFlag(heat, x, y, d,  2, -3, 0);
                this._setFlag(heat, x, y, d,  3, -2, 2);
                this._setFlag(heat, x, y, d,  3,  0, 2);
                this._setFlag(heat, x, y, d,  3,  2, 2);
                this._setFlag(heat, x, y, d, -2,  3, 4);
                this._setFlag(heat, x, y, d,  0,  3, 4);
                this._setFlag(heat, x, y, d,  2,  3, 4);
                this._setFlag(heat, x, y, d, -3, -2, 6);
                this._setFlag(heat, x, y, d, -3,  0, 6);
                this._setFlag(heat, x, y, d, -3,  2, 6);
            }
            else if (c === 'stone-wall') {
                this._setFlag(wall, x, y, d,  0, -1, 0);
                this._setFlag(wall, x, y, d,  1,  0, 2);
                this._setFlag(wall, x, y, d,  0,  1, 4);
                this._setFlag(wall, x, y, d, -1,  0, 6);
            }
            else if (c === 'gate') {
                this._setFlag(wall, x, y, d,  0, -1, 0);
                this._setFlag(wall, x, y, d,  0,  1, 4);
            }
        }
    }

    getConnectionFlags(entity) {
        const x = entity.position.x;
        const y = entity.position.y;
        const c = ConnectionEquivalentDict[entity.name] || entity.name;

        if (c === 'transport-belt') {
            return this._connFlagsBelt[this._toUniqueKey(x, y)];
        }
        else if (c === 'pipe') {
            return this._connFlagsPipe[this._toUniqueKey(x, y)];
        }
        else if (c === 'heat-pipe') {
            return this._connFlagsHeat[this._toUniqueKey(x, y)];
        }
        else if (c === 'stone-wall') {
            return this._connFlagsWall[this._toUniqueKey(x, y)];
        }
        else {
            return 0;
        }
    }
}
