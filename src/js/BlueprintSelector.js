export default class BlueprintSelector {
    constructor(callback, domElement = document.createElement('select')) {
        this._domElement = domElement;
        this._callback = callback;

        this._domElement.addEventListener('change', (e) => {
            this._callback(this._domElement.children[this._domElement.selectedIndex].value);
        });
    }

    get domElement() { return this._domElement; }

    setData(idNamePairs) {
        while (this._domElement.firstChild) {
            this._domElement.removeChild(this._domElement.firstChild);
        }

        for (const id in idNamePairs) {
            const option = document.createElement('option');

            option.textContent = idNamePairs[id];
            option.value = id;

            this._domElement.appendChild(option);
        }
    }

    select(id, supressEvent = false) {
        this._domElement.value = id;

        if (!supressEvent) {
            this._callback(id);
        }
    }
}
