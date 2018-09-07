import NotFoundError from './NotFoundError';

export default class AdapterRegistry {
    constructor() {
        this.pairs = [];
    }

    /** @id MochiKit.Base.AdapterRegistry.prototype.register */
    register(name, check, wrap, override) {
        if (override) {
            this.pairs.unshift([name, check, wrap]);
        } else {
            this.pairs.push([name, check, wrap]);
        }
    }

    /** @id MochiKit.Base.AdapterRegistry.prototype.match */
    match(/* ... */) {
        for (var i = 0; i < this.pairs.length; i++) {
            var pair = this.pairs[i];
            if (pair[1].apply(this, arguments)) {
                return pair[2].apply(this, arguments);
            }
        }
        throw new NotFoundError();
    }

    /** @id MochiKit.Base.AdapterRegistry.prototype.unregister */
    unregister(name) {
        for (var i = 0; i < this.pairs.length; i++) {
            var pair = this.pairs[i];
            if (pair[0] == name) {
                this.pairs.splice(i, 1);
                return true;
            }
        }
        return false;
    }
}
