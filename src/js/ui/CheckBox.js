export class CheckBox {
    constructor(callback, domElement) {
        if (domElement === undefined) {
            domElement = document.createElement('input');
            domElement.type = 'checkbox';
        }

        this._domElement = domElement;
        this._callback = callback;

        this._domElement.addEventListener('change', (e) => {
            this._callback(this._domElement.checked);
        });
    }

    get domElement() { return this._domElement; }

    get() {
        return this._domElement.checked;
    }

    set(checked, supressEvent=false) {
        this._domElement.checked = checked;

        if (!supressEvent) {
            this._callback(checked);
        }
    }
}
