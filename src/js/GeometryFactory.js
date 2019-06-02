import {
    BufferAttribute,
    BufferGeometry
} from 'three'

import {
    Direction,
    RecipesHaveFluidInput,
    RecipesHaveNoFluidOutput
} from './Blueprint'

const VERTICES = {
    "default": {
        "positions": [
            -0.40,  0.40,
            -0.40, -0.40,
             0.40, -0.40,
             0.40,  0.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 0, 2]
    },
    "chest": {
        "positions": [
            -0.40,  0.40,
            -0.40, -0.40,
             0.40, -0.40,
             0.40,  0.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "small-electric-pole": {
        "positions": [
            -0.40,  0.40,
            -0.40, -0.40,
             0.40, -0.40,
             0.40,  0.40,

             0.10, -0.30,
            -0.20,  0.05,
             0.00,  0.05,
            -0.10,  0.30,
             0.20, -0.05,
             0.00, -0.05
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 4]
    },
    "big-electric-pole": {
        "positions": [
            -0.90,  0.90,
            -0.90, -0.90,
             0.90, -0.90,
             0.90,  0.90,

             0.10, -0.30,
            -0.20,  0.05,
             0.00,  0.05,
            -0.10,  0.30,
             0.20, -0.05,
             0.00, -0.05
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 4]
    },
    "transport-belt": {
        "positions": [
            -0.40, -0.50,
            -0.40,  0.50,
             0.40,  0.50,
             0.40, -0.50,
            -0.15, -0.15,
             0.00, -0.35,
             0.15, -0.15,
            -0.15,  0.35,
             0.00,  0.15,
             0.15,  0.35
        ],
        "indices": [0, 1, 3, 2, 4, 5, 5, 6, 7, 8, 8, 9]
    },
    "transport-belt-start-end": {
        "positions": [
            -0.40, -0.50,
            -0.40,  0.50,
             0.40,  0.50,
             0.40, -0.50,
            -0.15, -0.15,
             0.00, -0.35,
             0.15, -0.15,
            -0.15,  0.35,
             0.00,  0.15,
             0.15,  0.35
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 7, 8, 8, 9]
    },
    "transport-belt-turn-left": {
        "positions": [
            -0.40, -0.50,
            -0.50, -0.40,
            -0.50,  0.40,
             0.00,  0.40,
             0.40,  0.00,
             0.40, -0.50,

            -0.30, -0.23,
            -0.05, -0.25,
            -0.07,  0.00
        ],
        "indices": [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7, 8]
    },
    "transport-belt-turn-right": {
        "positions": [
             0.40, -0.50,
             0.50, -0.40,
             0.50,  0.40,
            -0.00,  0.40,
            -0.40,  0.00,
            -0.40, -0.50,

             0.30, -0.23,
             0.05, -0.25,
             0.07,  0.00
        ],
        "indices": [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7, 8]
    },
    "underground-belt-input": {
        "positions": [
            -0.40,  0.50,
            -0.40, -0.40,
             0.00, -0.50,
             0.40, -0.40,
             0.40,  0.50,
            -0.40, -0.10,
             0.00, -0.20,
             0.40, -0.10,
            -0.15,  0.35,
             0.00,  0.15,
             0.15,  0.35
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10]
    },
    "underground-belt-output": {
        "positions": [
            -0.40, -0.50,
            -0.40,  0.50,
             0.00,  0.40,
             0.40,  0.50,
             0.40, -0.50,
            -0.40,  0.20,
             0.00,  0.10,
             0.40,  0.20,
            -0.15, -0.15,
             0.00, -0.35,
             0.15, -0.15
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10]
    },
    "splitter": {
        "positions": [
            -0.90, -0.50,
            -0.90, -0.25,
            -0.90,  0.25,
            -0.90,  0.50,
            -0.10, -0.50,
            -0.10, -0.34,
            -0.10,  0.25,
            -0.10,  0.50,
             0.90, -0.50,
             0.90, -0.25,
             0.90,  0.25,
             0.90,  0.50,
             0.10, -0.50,
             0.10, -0.34,
             0.10,  0.25,
             0.10,  0.50,

            -1.00, -0.25,
             0.00, -0.35,
             1.00, -0.25,
             1.00,  0.25,
            -1.00,  0.25
        ],
        "indices": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 17, 18, 18, 19, 19, 20, 20, 16]
    },
    "pipe-rl": {
        "positions": [
            -0.50, -0.35,
             0.50, -0.35,

            -0.50,  0.35,
             0.50,  0.35
        ],
        "indices": [0, 1, 2, 3]
    },
    "pipe-ur": {
        "positions": [
            -0.35, -0.50,
            -0.35,  0.10,
            -0.10,  0.35,
             0.50,  0.35,

             0.35, -0.50,
             0.35, -0.35,
             0.50, -0.35
        ],
        "indices": [0, 1, 1, 2, 2, 3, 4, 5, 5, 6]
    },
    "pipe-urd": {
        "positions": [
            -0.35, -0.50,
            -0.35,  0.50,

             0.35, -0.50,
             0.35, -0.35,
             0.50, -0.35,

             0.50,  0.35,
             0.35,  0.35,
             0.35,  0.50
        ],
        "indices": [0, 1, 2, 3, 3, 4, 5, 6, 6, 7]
    },
    "pipe-urdl": {
        "positions": [
            -0.35, -0.50,
            -0.35, -0.35,
            -0.50, -0.35,

            -0.50,  0.35,
            -0.35,  0.35,
            -0.35,  0.50,

             0.35, -0.50,
             0.35, -0.35,
             0.50, -0.35,

             0.50,  0.35,
             0.35,  0.35,
             0.35,  0.50
        ],
        "indices": [0, 1, 1, 2, 3, 4, 4, 5, 6, 7, 7, 8, 9, 10, 10, 11]
    },
    "pipe-to-ground": {
        "positions": [
            -0.35, -0.50,
            -0.35,  0.30,
             0.00,  0.40,
             0.35,  0.30,
             0.35, -0.50,

            -0.35,  0.05,
             0.00,  0.15,
             0.35,  0.05
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 6, 7]
    },
    "pump": {
        "positions": [
            -0.35, -1.00,
            -0.35,  1.00,
             0.35,  1.00,
             0.35, -1.00,

            -0.15, -0.15,
             0.00, -0.35,
             0.15, -0.15,

            -0.15,  0.35,
             0.00,  0.15,
             0.15,  0.35
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 4, 7, 8, 8, 9, 9, 7]
    },
    "offshore-pump": {
        "positions": [
            -0.35,  0.50,
            -0.35, -0.70,
             0.00, -0.80,
             0.35, -0.70,
             0.35,  0.50,

            -0.15,  0.00,
             0.00,  0.20,
             0.15,  0.00,

            -0.70, -0.40,
            -0.70,  0.40,
             0.70,  0.40,
             0.70, -0.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 5, 6, 6, 7, 7, 5, 8, 9, 9, 10, 10, 11, 11, 8]
    },
    "storage-tank": {
        "positions": [
            -1.40, -1.40,
            -1.40,  0.90,
            -0.90,  1.40,
             1.40,  1.40,
             1.40, -0.90,
             0.90, -1.40,

            -1.40, -1.50,
            -0.60, -1.50,
            -0.60, -1.40,

            -1.50, -1.40,
            -1.50, -0.60,
            -1.40, -0.60,

             1.40,  1.50,
             0.60,  1.50,
             0.60,  1.40,

             1.50,  1.40,
             1.50,  0.60,
             1.40,  0.60
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 0, 0, 6, 6, 7, 7, 8, 0, 9, 9, 10, 10, 11, 3, 12, 12, 13, 13, 14, 3, 15, 15, 16, 16, 17]
    },
    "heat-pipe-rl": {
        "positions": [
            -0.50, -0.15,
             0.50, -0.15,

            -0.50,  0.15,
             0.50,  0.15
        ],
        "indices": [0, 1, 2, 3]
    },
    "heat-pipe-ur": {
        "positions": [
            -0.15, -0.50,
            -0.15, -0.15,
             0.15,  0.15,
             0.50,  0.15,

             0.15, -0.50,
             0.15, -0.30,
             0.30, -0.15,
             0.50, -0.15
        ],
        "indices": [0, 1, 1, 2, 2, 3, 4, 5, 5, 6, 6, 7]
    },
    "heat-pipe-urd": {
        "positions": [
            -0.15, -0.50,
            -0.15,  0.50,

             0.15, -0.50,
             0.15, -0.15,
             0.50, -0.15,

             0.50,  0.15,
             0.15,  0.15,
             0.15,  0.50
        ],
        "indices": [0, 1, 2, 3, 3, 4, 5, 6, 6, 7]
    },
    "heat-pipe-urdl": {
        "positions": [
            -0.15, -0.50,
            -0.15, -0.15,
            -0.50, -0.15,

            -0.50,  0.15,
            -0.15,  0.15,
            -0.15,  0.50,

             0.15, -0.50,
             0.15, -0.15,
             0.50, -0.15,

             0.50,  0.15,
             0.15,  0.15,
             0.15,  0.50
        ],
        "indices": [0, 1, 1, 2, 3, 4, 4, 5, 6, 7, 7, 8, 9, 10, 10, 11]
    },
    "inserter": {
        "positions": [
            -0.25,  0.70,
             0.00,  0.90,
             0.25,  0.70,
             0.00, -0.85,
            -0.25, -0.85,
             0.25, -0.85
        ],
        "indices": [0, 1, 1, 2, 1, 3, 4, 5]
    },
    "long-handed-inserter": {
        "positions": [
            -0.25,  1.70,
             0.00,  1.90,
             0.25,  1.70,
             0.00, -1.85,
            -0.25, -1.85,
             0.25, -1.85
        ],
        "indices": [0, 1, 1, 2, 1, 3, 4, 5]
    },
    "rail-signal": {
        "positions": [
             0.20, -0.30,
            -0.10,  0.00,
             0.20,  0.30,
             0.50,  0.00
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "beacon": {
        "positions": [
            -1.40,  1.40,
            -1.40, -1.40,
             1.40, -1.40,
             1.40,  1.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "electric-furnace": {
        "positions": [
            -1.40,  1.40,
            -1.40, -1.40,
             1.40, -1.40,
             1.40,  1.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "assembling-machine": {
        "positions": [
            -1.40,  1.40,
            -1.40, -1.40,
             1.40, -1.40,
             1.40,  1.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "assembling-machine-fluid-input": {
        "positions": [
            -1.40,  1.40,
            -1.40, -1.40,
             1.40, -1.40,
             1.40,  1.40,

            -0.40, -1.40,
            -0.40, -1.50,
             0.40, -1.50,
             0.40, -1.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7]
    },
    "chemical-plant": {
        "positions": [
            -1.40, -1.40,
             1.40, -1.40,
             1.40,  1.40,
            -1.40,  1.40,

            -1.40, -1.40,
            -1.40, -1.50,
            -0.60, -1.50,
            -0.60, -1.40,
             1.40, -1.40,
             1.40, -1.50,
             0.60, -1.50,
             0.60, -1.40,

            -1.40,  1.40,
            -1.40,  1.50,
            -0.60,  1.50,
            -0.60,  1.40,
             1.40,  1.40,
             1.40,  1.50,
             0.60,  1.50,
             0.60,  1.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 8, 9, 9, 10, 10, 11, 12, 13, 13, 14, 14, 15, 16, 17, 17, 18, 18, 19]
    },
    "chemical-plant-no-output": {
        "positions": [
            -1.40, -1.40,
             1.40, -1.40,
             1.40,  1.40,
            -1.40,  1.40,

            -1.40, -1.40,
            -1.40, -1.50,
            -0.60, -1.50,
            -0.60, -1.40,
             1.40, -1.40,
             1.40, -1.50,
             0.60, -1.50,
             0.60, -1.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 8, 9, 9, 10, 10, 11]
    },
    "oil-refinery": {
        "positions": [
            -2.40,  2.40,
            -2.40, -2.40,
             2.40, -2.40,
             2.40,  2.40,

            -2.40, -2.40,
            -2.40, -2.50,
            -1.60, -2.50,
            -1.60, -2.40,

            -0.40, -2.40,
            -0.40, -2.50,
             0.40, -2.50,
             0.40, -2.40,

             2.40, -2.40,
             2.40, -2.50,
             1.60, -2.50,
             1.60, -2.40,

            -1.40,  2.40,
            -1.40,  2.50,
            -0.60,  2.50,
            -0.60,  2.40,

             1.40,  2.40,
             1.40,  2.50,
             0.60,  2.50,
             0.60,  2.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 8, 9, 9, 10, 10, 11, 12, 13, 13, 14, 14, 15, 16, 17, 17, 18, 18, 19, 20, 21, 21, 22, 22, 23]
    },
    "boiler": {
        "positions": [
            -1.40,  0.90,
            -1.40, -0.50,
            -0.80, -0.90,
             0.80, -0.90,
             1.40, -0.50,
             1.40,  0.90,

            -1.40,  0.90,
            -1.50,  0.90,
            -1.50,  0.10,
            -1.40,  0.10,

             1.40,  0.90,
             1.50,  0.90,
             1.50,  0.10,
             1.40,  0.10,

            -0.40, -0.90,
            -0.40, -1.00,
             0.40, -1.00,
             0.40, -0.90,

            -0.15,  0.90,
            -0.15,  1.00,
             0.15,  1.00,
             0.15,  0.90
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 0, 6, 7, 7, 8, 8, 9, 10, 11, 11, 12, 12, 13, 14, 15, 15, 16, 16, 17, 18, 19, 19, 20, 20, 21]
    },
    "steam-engine": {
        "positions": [
            -1.40,  2.40, -1.40, -2.40,  1.40, -2.40,  1.40,  2.40,
            -0.40, -2.40, -0.40, -2.50,  0.40, -2.50,  0.40, -2.40,
            -0.40,  2.40, -0.40,  2.50,  0.40,  2.50,  0.40,  2.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 8, 9, 9, 10, 10, 11]
    },
    "nuclear-reactor": {
        "positions": [
            -2.40,  2.40, -2.40, -2.40,  2.40, -2.40,  2.40,  2.40,

            -2.40, -2.40, -2.40, -2.50, -1.60, -2.50, -1.60, -2.40,
            -0.40, -2.40, -0.40, -2.50,  0.40, -2.50,  0.40, -2.40,
             1.60, -2.40,  1.60, -2.50,  2.40, -2.50,  2.40, -2.40,

            -2.40,  2.40, -2.40,  2.50, -1.60,  2.50, -1.60,  2.40,
            -0.40,  2.40, -0.40,  2.50,  0.40,  2.50,  0.40,  2.40,
             1.60,  2.40,  1.60,  2.50,  2.40,  2.50,  2.40,  2.40,

             2.40, -2.40,  2.50, -2.40,  2.50, -1.60,  2.40, -1.60,
             2.40, -0.40,  2.50, -0.40,  2.50,  0.40,  2.40,  0.40,
             2.40,  1.60,  2.50,  1.60,  2.50,  2.40,  2.40,  2.40,

            -2.40, -2.40, -2.50, -2.40, -2.50, -1.60, -2.40, -1.60,
            -2.40, -0.40, -2.50, -0.40, -2.50,  0.40, -2.40,  0.40,
            -2.40,  1.60, -2.50,  1.60, -2.50,  2.40, -2.40,  2.40
        ],
        "indices": [
            0, 1, 1, 2, 2, 3, 3, 0,
            4, 5, 5, 6, 6, 7, 8, 9, 9, 10, 10, 11, 12, 13, 13, 14, 14, 15,
            16, 17, 17, 18, 18, 19, 20, 21, 21, 22, 22, 23, 24, 25, 25, 26, 26, 27,
            28, 29, 29, 30, 30, 31, 32, 33, 33, 34, 34, 35, 36, 37, 37, 38, 38, 39,
            40, 41, 41, 42, 42, 43, 44, 45, 45, 46, 46, 47, 48, 49, 49, 50, 50, 51
        ]
    },
    "rocket-silo": {
        "positions": [
            -4.40,  4.40,
            -4.40, -4.40,
             4.40, -4.40,
             4.40,  4.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "rect1x2": {
        "positions": [
            -0.40,  0.90,
            -0.40, -0.90,
             0.40, -0.90,
             0.40,  0.90
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "rect2x2": {
        "positions": [
            -0.90,  0.90,
            -0.90, -0.90,
             0.90, -0.90,
             0.90,  0.90
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "rect3x3": {
        "positions": [
            -1.40,  1.40,
            -1.40, -1.40,
             1.40, -1.40,
             1.40,  1.40
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    },
    "rect4x4": {
        "positions": [
            -1.90,  1.90,
            -1.90, -1.90,
             1.90, -1.90,
             1.90,  1.90
        ],
        "indices": [0, 1, 1, 2, 2, 3, 3, 0]
    }
}

const inflatePipeVertices = (prefix='pipe') => {
    const rotate90cw = (src) => {
        const dst = {
            "positions": [],
            "indices": src.indices
        };

        const sp = src.positions;
        const dp = dst.positions;

        for (let i = 0; i < sp.length; i+=2) {
            dp[i  ] = -sp[i+1];
            dp[i+1] =  sp[i  ];
        }

        return dst;
    };

    VERTICES[`${prefix}-ud`] = rotate90cw(VERTICES[`${prefix}-rl`]);

    VERTICES[`${prefix}-rd`] = rotate90cw(VERTICES[`${prefix}-ur`]);
    VERTICES[`${prefix}-dl`] = rotate90cw(VERTICES[`${prefix}-rd`]);
    VERTICES[`${prefix}-ul`] = rotate90cw(VERTICES[`${prefix}-dl`]);

    VERTICES[`${prefix}-rdl`] = rotate90cw(VERTICES[`${prefix}-urd`]);
    VERTICES[`${prefix}-udl`] = rotate90cw(VERTICES[`${prefix}-rdl`]);
    VERTICES[`${prefix}-url`] = rotate90cw(VERTICES[`${prefix}-udl`]);
};

const addRadiationSymbolVertices = (key, size=1.0, x=0, y=0) => {
    const v = VERTICES[key];

    const bladeInnerSegments = 8;
    const bladeOuterSegments = 16;

    const positions = [];
    const indices = [];

    addCircleVertices(key, 0.1*size, x, y, 16);

    const r = 0.15*size;
    const R = 0.5 * size;
    const blades = 3;
    const segments = bladeInnerSegments+1 + bladeOuterSegments+1;

    for (let i = 0; i < blades; i++) {
        const t0 = 2 * Math.PI * i / blades + Math.PI/3;

        for (let j = 0; j <= bladeInnerSegments; j++) {
            const t = t0 + Math.PI/3 * j / bladeInnerSegments;

            positions.push(x + r * Math.cos(t));
            positions.push(y + r * Math.sin(t));
        }

        for (let j = bladeOuterSegments; j >= 0; j--) {
            const t = t0 + Math.PI/3 * j / bladeOuterSegments;

            positions.push(x + R * Math.cos(t));
            positions.push(y + R * Math.sin(t));
        }

        const i0 = v.positions.length/2 + i*segments;

        for (let j = 0; j < segments; j++) {
            indices.push(i0 + j);
            indices.push(i0 + (j+1)%segments);
        }
    }

    v.positions = v.positions.concat(positions);
    v.indices = v.indices.concat(indices);
};

const addCircleVertices = (key, r=0.5, x=0, y=0, segments=16) => {
    const v = VERTICES[key];

    const positions = [];
    const indices = [];

    const i0 = v.positions.length/2;

    for (let i = 0; i < segments; i++) {
        const t = 2*Math.PI * i / segments;

        positions.push(x + r * Math.cos(t));
        positions.push(y + r * Math.sin(t));

        indices.push(i0 + i);
        indices.push(i0 + (i+1)%segments);
    }

    v.positions = v.positions.concat(positions);
    v.indices = v.indices.concat(indices);
}

const addGearVertices = (key, size=1.0, x=0, y=0) => {
    const v = VERTICES[key];

    addCircleVertices(key, 0.15*size, x, y);

    const tooth = 8;
    const R = 0.5*size;
    const r = 0.4*size;
    const T = 0.15;
    const t = 0.2;

    const i0 = v.positions.length/2;
    const segments = 4*tooth;

    const positions = [];
    const indices = [];

    for (let i = 0; i < tooth; i++) {
        const t0 = 2*Math.PI * i / tooth;

        positions.push(x + r * Math.cos(t0-t));
        positions.push(y + r * Math.sin(t0-t));
        positions.push(x + R * Math.cos(t0-T));
        positions.push(y + R * Math.sin(t0-T));
        positions.push(x + R * Math.cos(t0+T));
        positions.push(y + R * Math.sin(t0+T));
        positions.push(x + r * Math.cos(t0+t));
        positions.push(y + r * Math.sin(t0+t));

        indices.push(i0 + 4*i);
        indices.push(i0 + 4*i+1);
        indices.push(i0 + 4*i+1);
        indices.push(i0 + 4*i+2);
        indices.push(i0 + 4*i+2);
        indices.push(i0 + 4*i+3);
        indices.push(i0 + 4*i+3);
        indices.push(i0 + (4*i+4)%segments);
    }

    v.positions = v.positions.concat(positions);
    v.indices = v.indices.concat(indices);
};

const generateCurvedRail = (margin, segments) => {
    // calculate the arc whose central angle is (almost) 45 degs.
    const sqrt2 = Math.sqrt(2);
    const m = margin;

    // start point.
    const ax = m;
    const ay = 4;
    // end point.
    const bx = -2;
    const by = -3+(1-m)*sqrt2;

    // middle point of the chord.
    const invTan = (ay-by)/(bx-ax);
    const px = (ax+bx)/2;
    const py = (ay+by)/2;

    // center.
    const oy = 4;
    const ox = invTan * (oy-py) + px;

    // inner radius.
    const r = m-ox;
    // outer radius.
    const R = r+2-2*m;
    const theta = Math.asin((ay-by) / r);

    const inner = [];
    const outer = [];
    for (let i = 0; i <= segments; i++) {
        const t = theta*i/segments;
        const c = Math.cos(t);
        const s = Math.sin(t);

        inner.push(ox + r*c);
        inner.push(oy - r*s);
        outer.push(ox + R*c);
        outer.push(oy - R*s);
    }

    const innerIndices = [];
    const outerIndices = [];
    const interIndices = [];
    for (let i = 0; i < segments; i++) {
        innerIndices.push(i);
        innerIndices.push(i+1);
        outerIndices.push(segments+1+i);
        outerIndices.push(segments+1+i+1);
    }
    for (let i = 1; i < segments; i+=2) {
        interIndices.push(i);
        interIndices.push(segments+1+i);
    }

    const positions = inner.concat(outer);
    const indices = innerIndices.concat(outerIndices).concat(interIndices);

    // fill remaining.
    const d = (1-m)*sqrt2;
    const outerLastIndex = outerIndices[outerIndices.length-1];
    let index = positions.length/2-1;
    positions.push(-2);
    positions.push(-3-d);
    positions.push(-2);
    positions.push(-3);
    positions.push(-2+d/2);
    positions.push(-3-d/2);
    indices.push(outerLastIndex);
    indices.push(++index);
    indices.push(++index);
    indices.push(++index);

    VERTICES['curved-rail'] = { positions, indices };
};

const generateStraightRail = (margin, segments=6) => {
    const d = 1-margin;

    const positions = [-d, -1, -d, 1, d, -1, d, 1];
    const indices = [0, 1, 2, 3];

    for (let i = 1; i < segments; i+=2) {
        const y = -1+2*i/segments;
        positions.push(-d);
        positions.push(y);
        positions.push(d);
        positions.push(y);

        indices.push(i+3);
        indices.push(i+4);
    }

    VERTICES['straight-rail'] = { positions, indices };
};

const generateStraightRailDiag = (margin) => {
    const d = (1.0-margin)*Math.sqrt(2);

    const positions = [d, -1,-1, d, -d, -1, -1, -d, d/2, d/2-1, (d-1)/2, (d-1)/2, d/2-1, d/2, (-d-1)/2, (-d-1)/2, 0, -1, -1, 0];
    const indices = [0, 1, 2, 3, 4, 8, 5, 7, 6, 9];

    VERTICES['straight-rail-diag'] = { positions, indices };
};

const generateRailVertices = (margin, segments) => {
    generateCurvedRail(margin, segments);
    generateStraightRail(margin);
    generateStraightRailDiag(margin);
};

const init = () => {
    const equivalentDict = {
        "wooden-chest": "chest",
        "iron-chest": "chest",
        "steel-chest": "chest",
        "logistic-chest-active-provider": "chest",
        "logistic-chest-passive-provider": "chest",
        "logistic-chest-requester": "chest",
        "logistic-chest-storage": "chest",
        "logistic-chest-buffer": "chest",
        "medium-electric-pole": "small-electric-pole",
        "substation": "big-electric-pole",
        "fast-transport-belt": "transport-belt",
        "fast-transport-belt-turn-left": "transport-belt-turn-left",
        "fast-transport-belt-turn-right": "transport-belt-turn-right",
        "express-transport-belt": "transport-belt",
        "express-transport-belt-turn-left": "transport-belt-turn-left",
        "express-transport-belt-turn-right": "transport-belt-turn-right",
        "fast-underground-belt-input": "underground-belt-input",
        "fast-underground-belt-output": "underground-belt-output",
        "express-underground-belt-input": "underground-belt-input",
        "express-underground-belt-output": "underground-belt-output",
        "fast-splitter": "splitter",
        "express-splitter": "splitter",
        "burner-inserter": "inserter",
        "fast-inserter": "inserter",
        "filter-inserter": "inserter",
        "stack-inserter": "inserter",
        "stack-filter-inserter": "inserter",
        "rail-chain-signal": "rail-signal",
        "steam-turbine": "steam-engine",
        "heat-exchanger": "boiler",
        "assembling-machine-1": "assembling-machine",
        "assembling-machine-2": "assembling-machine",
        "assembling-machine-3": "assembling-machine",
        "assembling-machine-2-fluid-input": "assembling-machine-fluid-input",
        "assembling-machine-3-fluid-input": "assembling-machine-fluid-input",
        "decider-combinator": "rect1x2",
        "arithmetic-combinator": "rect1x2",
        "burner-mining-drill": "rect2x2",
        "steel-furnace": "rect2x2",
        "stone-furnace": "rect2x2",
        "train-stop": "rect2x2",
        "accumulator": "rect2x2",
        "centrifuge": "rect3x3",
        "electric-mining-drill": "rect3x3",
        "lab": "rect3x3",
        "radar": "rect3x3",
        "solar-panel": "rect3x3",
        "roboport": "rect4x4"
    };

    for (const key in equivalentDict) {
        VERTICES[key] = VERTICES[equivalentDict[key]];
    }

    inflatePipeVertices('pipe');

    inflatePipeVertices('heat-pipe');

    generateRailVertices(0.5, 22);

    addCircleVertices('nuclear-reactor', 2.0, 0, 0, 32);
    addCircleVertices('storage-tank', 1.4, 0, 0, 32);
    addCircleVertices('rocket-silo', 4.0, 0, 0, 48)

    addRadiationSymbolVertices('nuclear-reactor', 1.6);
};

init();

export class GeometryFactory {
    constructor() {
        this._cache = {};
    }

    create(entity, useCache = true) {
        const type = entity.type;
        const dirc = entity.direction || 0;

        let key = entity.name;

        if (type !== undefined) {
            key += `-${type}`;
        }

        if (entity.category === 'transport-belt') {
            const conn = entity.connection_flags_belt;

            if (conn !== undefined) {
                const relDircD = (dirc + Direction.UP   ) % 8;
                const relDircL = (dirc + Direction.RIGHT) % 8;
                const relDircU = (dirc + Direction.DOWN ) % 8;
                const relDircR = (dirc + Direction.LEFT ) % 8;
                const isConnU = ((conn>>relDircU) & 1) === 1;
                const isConnR = ((conn>>relDircR) & 1) === 1;
                const isConnD = ((conn>>relDircD) & 1) === 1;
                const isConnL = ((conn>>relDircL) & 1) === 1;

                if (!isConnD && (isConnL ^ isConnR)) {
                    key += isConnL ? '-turn-left' : '-turn-right';
                }
            }
        }
        else if (entity.category === 'pipe' || entity.category === 'heat-pipe') {
            const conn = (entity.category === 'pipe') ? entity.connection_flags_pipe : entity.connection_flags_heat;

            if (conn !== undefined) {
                const isConnD = ((conn>>Direction.UP   ) & 1) === 1;
                const isConnL = ((conn>>Direction.RIGHT) & 1) === 1;
                const isConnU = ((conn>>Direction.DOWN ) & 1) === 1;
                const isConnR = ((conn>>Direction.LEFT ) & 1) === 1;

                // suffix characters must be put in this order.
                let suffix = '-';
                if (isConnU) suffix += 'u';
                if (isConnR) suffix += 'r';
                if (isConnD) suffix += 'd';
                if (isConnL) suffix += 'l';

                key += suffix;
            }
        }
        else if (entity.category === 'assembling-machine') {
            if (RecipesHaveFluidInput.includes(entity.recipe)) {
                key += '-fluid-input';
            }
        }
        else if (entity.category === 'chemical-plant') {
            if (RecipesHaveNoFluidOutput.includes(entity.recipe)) {
                key += '-no-output';
            }
        }

        if (entity.name === 'straight-rail') {
            if ((dirc & 1) === 1) {
                key += '-diag';
            }
        }

        if (useCache) {
            const cache = this._cache[key];

            if (cache !== undefined) {
                return cache;  
            }
        }

        let src = VERTICES[key];
        if (src === undefined) {
            console.warn(`${key} is not defined.`);

            src = VERTICES['default'];
        }

        const len = src.positions.length / 2;
        const positions = [];
        for (let i = 0; i < len; i++) {
            positions[3*i  ] = src.positions[2*i  ];
            positions[3*i+1] = src.positions[2*i+1];
            positions[3*i+2] = 0;
        }

        const geometry = new BufferGeometry();
        geometry.addAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
        geometry.setIndex(new BufferAttribute(new Uint16Array(src.indices), 1));

        if (useCache) {
            this._cache[key] = geometry;
        }

        return geometry;
    }
}
