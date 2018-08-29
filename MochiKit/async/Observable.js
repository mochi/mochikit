export default class Observable {
    constructor() {
        this.observers = [];
    }

    observe({ next, error, teardown }) {
        if (typeof next !== 'function') {
            throw new Error('Expected a function.');
        }

        this.observers.push({ next, error, teardown });
        return this;
    }

    observeNext(func) {
        return this.observe({ next: func });
    }

    observeError(func) {
        return this.observe({ error: func });
    }

    observeTeardown(func) {
        return this.observe({ teardown: func });
    }

    unobserve(next) {
        if (typeof next !== 'function') {
            throw new Error('Expected a function.');
        }

        let self = this;

        this.observers = this.observers.filter((obj) => {
            if (obj.next === next) {
                //Match
                if (obj.teardown) {
                    obj.teardown(next, obj);
                }

                return false;
            }

            return true;
        });

        return this;
    }

    clear() {
        this.observers = [];
        return this;
    }

    notify(param) {
        this.observers.forEach((obj) => {
            try {
                obj.next(param);
            } catch (error) {
                if (obj.error) {
                    obj.error(error, obj);
                }
            }
        });

        return this;
    }

    once(observer) {
        let self = this,
            { next } = observer;

        observer.next = (param) => {
            next(param);
            self.unobserve(next);
        };
    }
}
