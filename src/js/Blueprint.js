import zlib from 'zlib'

export const Direction = {
    UP: 0,
    RIGHT: 2,
    DOWN: 4,
    LEFT: 6
};

export const RecipesHaveNoFluidOutput = [
    'sulfur',
    'battery',
    'plastic-bar',
    'solid-fuel-from-heavy-oil',
    'solid-fuel-from-light-oil',
    'solid-fuel-from-petroleum-gas'
];

export const RecipesHaveFluidInput = [
    'express-transport-belt',
    'express-underground-belt',
    'express-splitter',
    'processing-unit',
    'electric-engine-unit'
];

export class BlueprintLoader {
    async decodeString(source, autoCreateBook = false) {
        return new Promise((resolve, reject) => {
            const version = source[0];

            if (version !== '0') {
                console.warn(`unsupported version. continue anyway. : version = ${version}`);
            }

            const body = source.substr(1);
            const src = Buffer.from(body, 'base64');

            zlib.inflate(src, (err, dst) => {
                if (err !== null) {
                    reject(err);

                    return;
                }

                const str = dst.toString('utf-8');
                let json = JSON.parse(str);

                if (autoCreateBook && (json['blueprint_book'] === undefined)) {
                    const blueprint = json;
                    blueprint.index = 0;

                    const book = {
                        "blueprint_book": {
                            "active_index": 0,
                            "blueprints": [blueprint]
                        }
                    };

                    json = book;
                }

                resolve(json);
            });
        });
    }

    async decodeFromUrl(url, autoCreateBook = false) {
        const resp = await fetch(url);
        const text = await resp.text();
        return this.decodeString(text, autoCreateBook);
    }
}
