export class ColorPicker {
    constructor(callback, domElement) {
        if (domElement === undefined) {
            domElement = document.createElement('input');
            domElement.type = 'color';
        }

        this._domElement = domElement;
        this._callback = callback;

        this._domElement.addEventListener('input', (e) => {
            this._callback(this._domElement.value);
        });
    }

    get domElement() { return this._domElement; }

    get() {
        return this._domElement.value;
    }

    set(colorHexString, supressEvent=false) {
        this._domElement.value = colorHexString;

        if (!supressEvent) {
            this._callback(colorHexString);
        }
    }
}
