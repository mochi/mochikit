export default class Message {
    constructor(event, emitter) {
        this.time = Date.now();
        this.event = event;
        this.emitter = emitter;
    }
}