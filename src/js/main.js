import style from '../css/main.css'

import { BlueprintLoader } from './Blueprint'
import BlueprintSelector from './BlueprintSelector'
import Renderer from './Renderer'

document.addEventListener('DOMContentLoaded', async () => {
    const loader = new BlueprintLoader();
    let currentBook = null;

    const blueprintSelector = new BlueprintSelector((selectedId) => {
        const id = parseInt(selectedId, 10);
        const blueprint = currentBook['blueprints'].find((elem) => elem['index'] === id)['blueprint'];
        renderer.setBlueprint(blueprint);
    }, document.querySelector('#select-blueprint'));

    const renderer = new Renderer();
    document.body.appendChild(renderer.domElement);

    const loadBlueprintString = async (source) => {
        try {
            const book = await loader.decodeString(source, true);
            setBlueprintBook(book);
        }
        catch(e) {
            alert('Failed to decode string.\nThe blueprint is corrupted or using an unsupported version.');
        }
    };

    const loadBlueprintFromUrl = async (url) => {
        try {
            const book = await loader.decodeFromUrl(url, true);
            setBlueprintBook(book);
        }
        catch(e) {
            alert('Failed to decode string.\nThe blueprint is corrupted or using an unsupported version.');
        }
    };

    const setBlueprintBook = async (blueprintBook) => {
        currentBook = blueprintBook['blueprint_book'];

        const blueprintIdMap = {};
        for (const bp of currentBook['blueprints']) {
            const id = bp['index'];
            const name = bp['blueprint']['label'] || `untitled-${id}`;
            blueprintIdMap[id] = name;
        }
        blueprintSelector.setData(blueprintIdMap);
        blueprintSelector.select(currentBook['active_index']);
    }

    const saveUrl = (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blueprint.png';

        const e = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        document.body.appendChild(a);
        a.dispatchEvent(e);
        document.body.removeChild(a);
    };

    const updateIconsVisibility = () => {
        renderer.setIconsVisibility(checkShowIcons.checked);
    }

    const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const update = () => {
        renderer.update();
    };

    const render = () => {
        renderer.render();
    };

    const animate = () => {
        requestAnimationFrame(animate);

        update();
        render();
    }

    onResize();
    animate();

    document.querySelector('#button-load-blueprint').addEventListener('click', () => {
        const result = prompt('Paste blueprint string here.');

        if (result !== null) {
            loadBlueprintString(result);
        }
    });

    document.querySelector('#button-save-image').addEventListener('click', () => {
        const canvas = renderer.renderToImage();

        if (canvas.toBlob) {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                saveUrl(url);
                URL.revokeObjectURL(url);
            });
        }
        else {
            saveUrl(canvas.toDataURL());
        }
    });

    const checkShowIcons = document.querySelector('#check-show-icons');
    checkShowIcons.addEventListener('change', (e) => {
        updateIconsVisibility();
    });

    document.addEventListener('dragenter', (e) => { e.preventDefault(); });
    document.addEventListener('dragover',  (e) => { e.preventDefault(); });
    document.addEventListener('dragleave', (e) => { e.preventDefault(); });
    document.addEventListener('drop', (e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result;
                loadBlueprintString(text);
            };
            reader.readAsText(files[0]);
        }
    });

    window.addEventListener('resize', () => {
        onResize();
    });

    updateIconsVisibility();

    const params = location.search.substr(1).split('&').map(p => p.split('='))
            .reduce((map, p) => Object.assign({ [p[0]]: p[1] }, map), {});

    if (params['string'] !== undefined) {
        loadBlueprintString(params['string']);
    }
    else if (params['url'] !== undefined) {
        loadBlueprintFromUrl(params['url']);
    }
    else {
        loadBlueprintFromUrl('https://raw.githubusercontent.com/migiyubi/printorio/master/blueprint_sample/all_science_100.bp');
    }
});
