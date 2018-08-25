import Message from './Message';

export default class MessageEmitter {
    constructor() {
        this.messages = [];
        this.handlers = [];
        this.collecting = true;
        this.onerror = null;
    }

    on(event, func) {
        this.handlers.push([event, func]);
        return this;
    }

    off(event, func) {
        this.handlers = this.handlers.filter(
            ([$event, $func]) => $func !== func && $event !== event
        );
        return this;
    }

    has(event) {
        for (let [$event] of this.handlers) {
            if ($event === event) {
                return true;
            }
        }

        return false;
    }

    emitWithGuard(event, onerror) {
        for (let [$event, func] of this.handlers) {
            if (event === $event) {
                try {
                    func(this.createMessage(event));
                } catch (error) {
                    onerror(error);

                    if (this.onerror) {
                        this.onerror(error, event, func);
                    }
                }
            }
        }

        return this;
    }

    emit(event) {
        return this.emitWithGuard(event, (e) => {
            throw e;
        });
    }

    createMessage(event) {
        let msg = new Message(event, this);
        this.addMessage(msg);
        return this;
    }

    addMessage(msg) {
        if (this.collecting) {
            this.messages.push(msg);
        }

        return this;
    }

    hasHandler(func) {
        for (let [, $func] of this.handlers) {
            if ($func === func) {
                return true;
            }
        }

        return false;
    }

    whenEmitted(event) {
        let self = this;

        return new Promise((resolve, reject) => {
            self.on(event, resolve);
        });
    }

    whenFailed(event) {
        let self = this;

        return new Promise((resolve, reject) => {
            let rejected = false;
            self.emitWithGuard(event, (e) => {
                rejected = true, reject(e);
            });

            if(!rejected) {
                resolve(event);
            }
        });
    }

    emitDisposing(event, onerror) {
        if(onerror) {
            this.emitWithGuard(event, onerror);
        } else {
            this.emit(event);
        }

        this.dispose(event);
        return this;
    }

    dispose(event) {
        let handlers = this.handlers;
        this.handlers.forEach(([el], index) => {
            if(el === event) {
                handlers.splice(index, 1);
            }
        });
        return this;
    }

    removeMessages($event) {
        this.messages = this.messages.filter(({ event }) => event !== $event);
        return this;
    }

    anyMessages() {
        return this.messages.length !== 0;
    }

    clearMessages() {
        this.messages = [];
        return this;
    }

    isCollecting() {
        return this.collecting;
    }

    clearHandlers() {
        this.handlers = [];
        return this;
    }

    anyHandlers() {
        return this.handlers.length !== 0;
    }

    pop() {
        this.handlers.pop();
        return this;
    }

    concat(...items) {
        this.handlers.concat(...items);
        return this;
    }

    conjoin(map) {
        for(let val, key of Object.keys(map)) {
            val = map[key];
            this.on(key, val);
        }
        
        return this;
    }

    /**
     * 
     * @param {!Map} map 
     */
    conjoinMap(map) {
        for(let val, key of map.keys()) {
            val = map.get(key);
            this.on(key, val);
        }

        return this;
    }

    onArray(event, array) {
        for(let func of array) {
            this.on(event, func);
        }

        return this;
    }

    keys() {
        return this.mapIndex(0);
    }

    values() {
        return this.mapIndex(1);
    }

    pairs() {
        return this.handlers;
    }

    mapIndex(index) {
        index = +index;
        return this.handlers.map((arr) => arr[index]);
    }

    once(event, func) {
        let self = this;
        return this.on(event, (msg) => {
            self.off(event, func);
            func(msg);
        });
    }

    toObject() {
        let object = {};
        for(let [event, func] of this.handlers) {
            object[event] = func;
        }
        return object;
    }

    emitAfter(event, timeout) {
        let self = this;
        setTimeout(() => {
            self.emit(event);
        }, timeout);
        return this;
    }

    emitTimes(event, times) {
        for(let i = 0; i < times; ++i) {
            this.emit(event);
        }
        return this;
    }

    emitUntil(event, func, limit) {
        for(let i = 0; i < limit && func(event, i, limit); ++i) {
            this.emit(event);
        }

        return this;
    }

    messagesAt(time) {
        return this.filterMessages((msg) => msg.time === time);
    }

    messagesBefore(time) {
        return this.filterMessages((msg) => msg.time < time);
    }

    messagesAfter(time) {
        return this.filterMessages((msg) => msg.time > time);
    }

    messagesFor(event) {
        return this.filterMessages((msg) => msg.event === event);
    }

    messagesNotFor(event) {
        return this.filterMessages((msg) => msg.event !== event);
    }

    messagesMatching(msg) {
        return this.filterMessages(($msg) => msg.event === $msg.event && msg.time === $msg.time);
    }

    messagesNotMatching(msg) {
        return this.filterMessages(($msg) => msg.event !== $msg.event && $msg.time !== msg.time);
    }

    messagesMap() {
        let map = new Map();

        for(let set, msg of this.messages) {
            if(set = map.get(msg.event)) {
                set.add(msg);
            } else {
                map.set(msg.event, new WeakSet());
                map.get(msg.event).add(msg);
            }
        }

        return map;
    }

    pipe(msge) {
        for(let [event, func] of this.handlers) {
            msge.on(event, func);
        }

        msge.messages = this.messages;
        return msge;
    }

    filterMessages(func) {
        let map = [];
        for(let msg of this.messages) {
            if(func(msg, map, this)) {
                map.push(msg);
            }
        }
        return map;
    }
}
