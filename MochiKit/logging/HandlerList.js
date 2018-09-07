export default class HandlerList {
    constructor() {
        this.handlers = [];
    }

    addHandler(func) {
        if(typeof func !== 'function') {
            throw new Error('Not a function.');
        }

        this.handlers.push(func);
        return this;
    }

    fire(data) {
        this.handlers.forEach((a) => a(data));
    }

    isEmpty() {
        return this.handlers.length === 0;
    }

    isNotEmpty() {
        return !this.isEmpty();
    }

    clear() {
        this.handlers = [];
        return this;
    }
}