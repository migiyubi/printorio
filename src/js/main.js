import style from '../css/main.css'

import { BlueprintLoader } from './Blueprint'
import { BlueprintSelector } from './BlueprintSelector'
import { ColorPicker } from './ColorPicker'
import { Renderer } from './Renderer'

document.addEventListener('DOMContentLoaded', async () => {
    const loader = new BlueprintLoader();
    let currentBlueprints = [];

    const blueprintSelector = new BlueprintSelector((selectedId) => {
        const id = parseInt(selectedId, 10);
        const blueprint = currentBlueprints[id];
        renderer.setBlueprint(blueprint);
    }, document.querySelector('#select-blueprint'));

    const colorPickerBackground = new ColorPicker((color) => {
        renderer.setBackgroundColor(color);
    }, document.querySelector('#color-background'));

    const colorPickerLine = new ColorPicker((color) => {
        renderer.setLineColor(color);
    }, document.querySelector('#color-line'));

    const renderer = new Renderer();
    document.body.appendChild(renderer.domElement);

    const loadBlueprintString = async (source) => {
        try {
            const bp = await loader.decodeString(source);
            setBlueprintTree(bp);
        }
        catch(e) {
            alert('Failed to decode string.\nThe blueprint is corrupted or using an unsupported version.');
        }
    };

    const loadBlueprintFromUrl = async (url) => {
        try {
            const bp = await loader.decodeFromUrl(url);
            setBlueprintTree(bp);
        }
        catch(e) {
            alert('Failed to decode string.\nThe blueprint is corrupted or using an unsupported version.');
        }
    };

    const extractBlueprinTree = (blueprintTree, dst=[]) => {
        if (blueprintTree['blueprint_book']) {
            for (const bp of blueprintTree['blueprint_book']['blueprints']) {
                extractBlueprinTree(bp, dst);
            }
        }

        if (blueprintTree['blueprint']) {
            dst.push(blueprintTree['blueprint']);
        }

        return dst;
    };

    const setBlueprintTree = async (blueprintTree) => {
        currentBlueprints = extractBlueprinTree(blueprintTree);

        let index = 0;
        let autoId = 0;
        const blueprintIdMap = {};
        for (const bp of currentBlueprints) {
            const name = bp['label'] || `untitled-${autoId++}`;
            blueprintIdMap[index] = name;
            ++index;
        }
        blueprintSelector.setData(blueprintIdMap);
        blueprintSelector.select(0);
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

    let saving = false;
    document.querySelector('#button-save-image').addEventListener('click', () => {
        if (saving) {
            return;
        }

        saving = true;

        const canvas = renderer.renderToImage();

        if (canvas.toBlob) {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                saveUrl(url);
                URL.revokeObjectURL(url);
                saving = false;
            });
        }
        else {
            saveUrl(canvas.toDataURL());
            saving = false;
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
    colorPickerLine.set('#ffffff');
    colorPickerBackground.set('#0170c1');

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
