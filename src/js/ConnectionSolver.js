import {
    Direction,
    RecipesHaveFluidInput,
    RecipesHaveNoFluidOutput
} from './Blueprint'

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
    _setFlag(map, x, y, direction) {
        const key = this._toUniqueKey(x, y);
        const flag = 1<<direction;
        map[key] = (map[key] === undefined) ? flag : (map[key] | flag);
    }

    init(entities) {
        this._connFlagsBelt = {};
        this._connFlagsPipe = {};
        this._connFlagsHeat = {};
        const belt = this._connFlagsBelt;
        const pipe = this._connFlagsPipe;
        const heat = this._connFlagsHeat;

        for (const entity of entities) {
            const d = entity.direction || 0;
            const x = entity.position.x;
            const y = entity.position.y;
            const t = entity.type;
            const c = ConnectionEquivalentDict[entity.name] || entity.name;

            if (c === 'transport-belt') {
                switch (d) {
                    case Direction.UP:    this._setFlag(belt, x, y-1, d); break;
                    case Direction.RIGHT: this._setFlag(belt, x+1, y, d); break;
                    case Direction.DOWN:  this._setFlag(belt, x, y+1, d); break;
                    case Direction.LEFT:  this._setFlag(belt, x-1, y, d); break;
                    default: break;
                }
            }
            else if (c === 'underground-belt') {
                if (t === 'output') {
                    switch (d) {
                        case Direction.UP:    this._setFlag(belt, x, y-1, d); break;
                        case Direction.RIGHT: this._setFlag(belt, x+1, y, d); break;
                        case Direction.DOWN:  this._setFlag(belt, x, y+1, d); break;
                        case Direction.LEFT:  this._setFlag(belt, x-1, y, d); break;
                        default: break;
                    }
                }
                else {
                    // TODO: check also input connections so that we can find terminal belts.

                }
            }
            else if (c === 'splitter') {
                switch (d) {
                    case Direction.UP:    this._setFlag(belt, x-0.5, y-1, d); this._setFlag(belt, x+0.5, y-1, d); break;
                    case Direction.RIGHT: this._setFlag(belt, x+1, y-0.5, d); this._setFlag(belt, x+1, y+0.5, d); break;
                    case Direction.DOWN:  this._setFlag(belt, x-0.5, y+1, d); this._setFlag(belt, x+0.5, y+1, d); break;
                    case Direction.LEFT:  this._setFlag(belt, x-1, y-0.5, d); this._setFlag(belt, x-1, y+0.5, d); break;
                    default: break;
                }

                // TODO: check also input connections so that we can find terminal belts.

            }
            else if (c === 'pipe') {
                this._setFlag(pipe, x, y-1, Direction.UP);
                this._setFlag(pipe, x+1, y, Direction.RIGHT);
                this._setFlag(pipe, x, y+1, Direction.DOWN);
                this._setFlag(pipe, x-1, y, Direction.LEFT);
            }
            else if (c === 'pipe-to-ground') {
                switch (d) {
                    case Direction.UP:    this._setFlag(pipe, x, y-1, d); break;
                    case Direction.RIGHT: this._setFlag(pipe, x+1, y, d); break;
                    case Direction.DOWN:  this._setFlag(pipe, x, y+1, d); break;
                    case Direction.LEFT:  this._setFlag(pipe, x-1, y, d); break;
                    default: break;
                }
            }
            else if (c === 'pump') {
                let key0, key1;
                switch (d) {
                    case Direction.UP:    this._setFlag(pipe, x, y-1.5, Direction.UP);    this._setFlag(pipe, x, y+1.5, Direction.DOWN);  break;
                    case Direction.RIGHT: this._setFlag(pipe, x+1.5, y, Direction.RIGHT); this._setFlag(pipe, x-1.5, y, Direction.LEFT);  break;
                    case Direction.DOWN:  this._setFlag(pipe, x, y+1.5, Direction.DOWN);  this._setFlag(pipe, x, y-1.5, Direction.UP);    break;
                    case Direction.LEFT:  this._setFlag(pipe, x-1.5, y, Direction.LEFT);  this._setFlag(pipe, x+1.5, y, Direction.RIGHT); break;
                    default: break;
                }
            }
            else if (c === 'offshore-pump') {
                switch (d) {
                    case Direction.UP:    this._setFlag(pipe, x, y+1, Direction.DOWN);  break;
                    case Direction.RIGHT: this._setFlag(pipe, x-1, y, Direction.LEFT);  break;
                    case Direction.DOWN:  this._setFlag(pipe, x, y-1, Direction.UP);    break;
                    case Direction.LEFT:  this._setFlag(pipe, x+1, y, Direction.RIGHT); break;
                    default: break;
                }
            }
            else if (c === 'storage-tank') {
                switch (d) {
                    case Direction.UP:
                        this._setFlag(pipe, x-1, y-2, Direction.UP); 
                        this._setFlag(pipe, x+2, y+1, Direction.RIGHT);
                        this._setFlag(pipe, x+1, y+2, Direction.DOWN);
                        this._setFlag(pipe, x-2, y-1, Direction.LEFT);
                        break;
                    case Direction.RIGHT:
                        this._setFlag(pipe, x+1, y-2, Direction.UP); 
                        this._setFlag(pipe, x+2, y-1, Direction.RIGHT);
                        this._setFlag(pipe, x-1, y+2, Direction.DOWN);
                        this._setFlag(pipe, x-2, y+1, Direction.LEFT);
                        break;
                    default:
                        break;
                }
            }
            else if (c === 'assembling-machine') {
                if (RecipesHaveFluidInput.includes(entity.recipe)) {
                    switch (d) {
                        case Direction.UP:    this._setFlag(pipe, x, y-2, d); break;
                        case Direction.RIGHT: this._setFlag(pipe, x+2, y, d); break;
                        case Direction.DOWN:  this._setFlag(pipe, x, y+2, d); break;
                        case Direction.LEFT:  this._setFlag(pipe, x-2, y, d); break;
                        default: break;
                    }
                }
            }
            else if (c === 'chemical-plant') {
                // inputs.
                switch (d) {
                    case Direction.UP:    this._setFlag(pipe, x-1, y-2, d); this._setFlag(pipe, x+1, y-2, d); break;
                    case Direction.RIGHT: this._setFlag(pipe, x+2, y-1, d); this._setFlag(pipe, x+2, y+1, d); break;
                    case Direction.DOWN:  this._setFlag(pipe, x-1, y+2, d); this._setFlag(pipe, x+1, y+2, d); break;
                    case Direction.LEFT:  this._setFlag(pipe, x-2, y-1, d); this._setFlag(pipe, x-2, y+1, d); break;
                    default: break;
                }

                // outputs.
                if (!RecipesHaveNoFluidOutput.includes(entity.recipe)) {
                    switch (d) {
                        case Direction.UP:    this._setFlag(pipe, x-1, y+2, Direction.DOWN);  this._setFlag(pipe, x+1, y+2, Direction.DOWN);  break;
                        case Direction.RIGHT: this._setFlag(pipe, x-2, y-1, Direction.LEFT);  this._setFlag(pipe, x-2, y+1, Direction.LEFT);  break;
                        case Direction.DOWN:  this._setFlag(pipe, x-1, y-2, Direction.UP);    this._setFlag(pipe, x+1, y-2, Direction.UP);    break;
                        case Direction.LEFT:  this._setFlag(pipe, x+2, y-1, Direction.RIGHT); this._setFlag(pipe, x+2, y+1, Direction.RIGHT); break;
                        default: break;
                    }
                }
            }
            else if (c === 'oil-refinery') {
                // inputs.
                switch (d) {
                    case Direction.UP:
                        this._setFlag(pipe, x+1, y+3, Direction.DOWN);
                        this._setFlag(pipe, x-1, y+3, Direction.DOWN);
                        break;
                    case Direction.RIGHT:
                        this._setFlag(pipe, x-3, y+1, Direction.LEFT);
                        this._setFlag(pipe, x-3, y-1, Direction.LEFT);
                        break;
                    case Direction.DOWN:
                        this._setFlag(pipe, x-1, y-3, Direction.UP);
                        this._setFlag(pipe, x+1, y-3, Direction.UP);
                        break;
                    case Direction.LEFT:
                        this._setFlag(pipe, x+3, y-1, Direction.RIGHT);
                        this._setFlag(pipe, x+3, y+1, Direction.RIGHT);
                        break;
                    default:
                        break;
                }

                // outputs.
                switch (d) {
                    case Direction.UP:
                        this._setFlag(pipe, x+2, y-3, d);
                        this._setFlag(pipe, x,   y-3, d);
                        this._setFlag(pipe, x-2, y-3, d);
                        break;
                    case Direction.RIGHT:
                        this._setFlag(pipe, x+3, y+2, d);
                        this._setFlag(pipe, x+3, y,   d);
                        this._setFlag(pipe, x+3, y-2, d);
                        break;
                    case Direction.DOWN:
                        this._setFlag(pipe, x-2, y+3, d);
                        this._setFlag(pipe, x,   y+3, d);
                        this._setFlag(pipe, x+2, y+3, d);
                        break;
                    case Direction.LEFT:
                        this._setFlag(pipe, x-3, y-2, d);
                        this._setFlag(pipe, x-3, y,   d);
                        this._setFlag(pipe, x-3, y+2, d);
                        break;
                    default:
                        break;
                }
            }
            else if (c === 'heat-pipe') {
                this._setFlag(heat, x, y-1, Direction.UP);
                this._setFlag(heat, x+1, y, Direction.RIGHT);
                this._setFlag(heat, x, y+1, Direction.DOWN);
                this._setFlag(heat, x-1, y, Direction.LEFT);
            }
            else if (c === 'boiler') {
                switch (d) {
                    case Direction.UP:
                        this._setFlag(pipe, x,   y-1.5, Direction.UP);
                        this._setFlag(pipe, x-2, y+0.5, Direction.LEFT);
                        this._setFlag(pipe, x+2, y+0.5, Direction.RIGHT);
                        this._setFlag(heat, x,   y+1.5, Direction.DOWN);
                        break;
                    case Direction.RIGHT:
                        this._setFlag(pipe, x+1.5, y,   Direction.RIGHT);
                        this._setFlag(pipe, x-0.5, y-2, Direction.UP);
                        this._setFlag(pipe, x-0.5, y+2, Direction.DOWN);
                        this._setFlag(heat, x-1.5, y,   Direction.LEFT);
                        break;
                    case Direction.DOWN:
                        this._setFlag(pipe, x,   y+1.5, Direction.DOWN);
                        this._setFlag(pipe, x+2, y-0.5, Direction.RIGHT);
                        this._setFlag(pipe, x-2, y-0.5, Direction.LEFT);
                        this._setFlag(heat, x,   y-1.5, Direction.UP);
                        break;
                    case Direction.LEFT:
                        this._setFlag(pipe, x-1.5, y,   Direction.LEFT);
                        this._setFlag(pipe, x+0.5, y+2, Direction.DOWN);
                        this._setFlag(pipe, x+0.5, y-2, Direction.UP);
                        this._setFlag(heat, x+1.5, y,   Direction.RIGHT);
                        break;
                    default:
                        break;
                }
            }
            else if (c === 'steam-engine') {
                switch (d) {
                    case Direction.UP:    this._setFlag(pipe, x, y-3, Direction.UP);   this._setFlag(pipe, x, y+3, Direction.DOWN);  break;
                    case Direction.RIGHT: this._setFlag(pipe, x-3, y, Direction.LEFT); this._setFlag(pipe, x+3, y, Direction.RIGHT); break;
                    default: break;
                }
            }
            else if (c === 'nuclear-reactor') {
                this._setFlag(heat, x-2, y-3, Direction.UP);
                this._setFlag(heat, x,   y-3, Direction.UP);
                this._setFlag(heat, x+2, y-3, Direction.UP);
                this._setFlag(heat, x+3, y-2, Direction.RIGHT);
                this._setFlag(heat, x+3, y,   Direction.RIGHT);
                this._setFlag(heat, x+3, y+2, Direction.RIGHT);
                this._setFlag(heat, x-2, y+3, Direction.DOWN);
                this._setFlag(heat, x,   y+3, Direction.DOWN);
                this._setFlag(heat, x+2, y+3, Direction.DOWN);
                this._setFlag(heat, x-3, y-2, Direction.LEFT);
                this._setFlag(heat, x-3, y,   Direction.LEFT);
                this._setFlag(heat, x-3, y+2, Direction.LEFT);
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
        else {
            return 0;
        }
    }
}
