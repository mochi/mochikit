export default class EventProxy {
    constructor(element) {
        this.events = [];
        this.element = element;
    }

    addEventListener(event, handler) {
        this.element.addEventListener(event, handler);
        this.events.push({ event, handler });
        return this;
    }

    removeEventListener(event, handler) {
        this.element.removeEventListener(event, handler);
        this.events = this.events.filter((obj) => obj.event !== event && obj.handler !== handler);
        return this;   
    }

    hasEventListener(event, handler) {
        return this.events.find((item) => item.event === event && item.handler === handler);
    }

    [Symbol.iterator]() {
        return this.events[Symbol.iterator]();
    }

    __repr__() {
        return `EventProxy`
    }

    size()
}