import { PENDING, REJECTED, RESOLVED, SETTLED } from './states';

let id = 0;

function Deferred(callback, canceller) {
    this.id = ++id;
    this.chain = [];

    //Allow the Deferred to be 'tapped',
    //meaning a .catch handler can be added,
    //but if no error catching handlers were
    //added using .catch, an error will still
    //be thrown.
    this.__error_handlers__ = [];
    this.silentlyCancelled = false;
    this.value = undefined;
    this.canceller = canceller;
    this.state = PENDING;

    //Add support for shorthand Deferred creation.
    if (typeof callback === 'function') {
        this.fire(callback);
    }
}

Deferred.prototype.fire = function(callback) {
    let self = this;

    //Make bound functions for 'this':
    function boundReject(value) {
        self.reject(value);
    }

    function boundResolve(value) {
        self.resolve(value);
    }

    try {
        callback(boundResolve, boundReject);
    } catch (error) {
        boundReject(error);
    }

    return this;
};

Deferred.prototype.cancel = function() {
    if (this.isSettled()) {
        //Might add custom AsyncError class:
        throw new Error('Cannot cancel a settled promise.');
    }

    if (this.canceller) {
        this.canceller(this, this.value);
    } else {
        this.silentlyCancelled = true;
    }

    return this;
};

Deferred.prototype.clearChain = function() {
    this.chain = [];
    return this;
};

Deferred.prototype.isEmpty = function() {
    return this.chain.length === 0;
};

Deferred.prototype.isResolved = function() {
    return this.state === RESOLVED;
};

Deferred.prototype.isRejected = function() {
    return this.state === REJECTED;
};

Deferred.prototype.isSettled = function() {
    return this.isRejected() || this.isResolved();
};

//Make the reject & resolve api available:
Deferred.prototype.reject = function(value) {
    this.value = value;
    this.state = REJECTED;

    //Stimulate a value map without disrupting
    //the chain value.
    let chainValue = value;

    for (let errfunc of this.__error_handlers__) {
        chainValue = errfunc(chainValue);
    }

    if (!this.anyFor(REJECTED)) {
        if (value instanceof Error) {
            //Interpolate the error message to
            //provide context.
            value.message = `Uncaught Deferred: ${value.message}`;
        } else {
            value = new Error(value);
        }

        throw value;
    }

    this.fireCallbacks();
};

Deferred.prototype.anyFor = function(state) {
    for (let [, $state] of this.chain) {
        if ($state === state) {
            return true;
        }
    }

    return false;
};

Deferred.prototype.then = function(func, errfunc) {
    if (typeof func === 'function') {
        this.addCallback(func, RESOLVED);
    }

    if (typeof errfunc === 'function') {
        this.addCallback(func, REJECTED);
    }

    return this;
};

Deferred.prototype.catch = function(errfunc) {
    return this.then(null, errfunc);
};

Deferred.prototype.finally = function(func) {
    if (typeof func === 'function') {
        this.addCallback(func, SETTLED);
    }

    return this;
};

Deferred.prototype.flip = function() {
    let newChain = [];
    for (let [callback, state] of this.chain) {
        if (state === REJECTED) {
            newChain.push([callback, RESOLVED]);
        } else if (state === RESOLVED) {
            newChain.push([callback, REJECTED]);
        } else {
            //We have a SETTLED state here,
            //just keep it as that.
            newChain.push([callback, state]);
        }
    }

    this.chain = newChain;
    return this;
};

Deferred.prototype.addCallback = function(callback, state) {
    if (state !== RESOLVED && state !== REJECTED && state !== SETTLED) {
        throw new Error('The provided state is not a valid state.');
    }

    if (this.state === state) {
        //The state matches.
        //Fire the callback.
        this.fireCallback(callback);
    } else {
        this.chain.push([callback, state]);
    }

    return this;
};

Deferred.prototype.fireCallbacks = function() {
    for (let [callback, state] of this.chain) {
        if (this.correctState(state)) {
            this.fireCallback(callback);
        }
    }

    return this;
};

Deferred.prototype.correctState = function(state) {
    return (
        (state === REJECTED && this.isRejected()) ||
        (state === RESOLVED && this.isResolved()) ||
        (state === SETTLED && this.isSettled())
    );
};

Deferred.prototype.fireCallback = function(callback) {
    this.value = callback(this.value);
    return this;
};

Deferred.prototype.resolve = function(value) {
    this.value = value;
    this.state = RESOLVED;
    this.fireCallbacks();
};

Deferred.prototype.rejectAfter = function(timeout, value) {
    return this.actionAfter('reject', timeout, value);
};

Deferred.prototype.resolveAfter = function(timeout, value) {
    return this.actionAfter('resolve', timeout, value);
};

Deferred.prototype.actionAfter = function(action, timeout, value) {
    let self = this,
        method = action === REJECTED ? 'reject' : 'resolve';

    setTimeout(function(timestamp) {
        self[method](value === undefined ? timestamp : value);
    }, timeout);
};

Deferred.prototype.catchSilent = function(errfunc) {
    return this.catch(function() {});
};

Deferred.prototype.tapCatch = function(errfunc) {
    if (this.state === REJECTED) {
        errfunc(this.value);
    } else {
        this.__error_handlers__.push(errfunc);
    }

    return this;
};

Deferred.prototype.tap = function(func) {
    return this.then(function(value) {
        //Prevent the value from being changed
        //by the callback, as it is a lazy function
        //meaning it performs operations without
        //returning a value.
        func(value);
        return value;
    });
};

Deferred.prototype.tapFinally = function(func) {
    return this.finally(function(value) {
        func(value);
        return value;
    });
};

Deferred.prototype.toPromise = function() {
    let self = this;

    return new Promise(function(resolve, reject) {
        self.tap(resolve).tapCatch(reject);
    });
};

Deferred.prototype.clone = function() {
    let deferred = new Deferred(null, this.canceller);
    deferred.chain = this.chain;
    deferred.state = this.state;
    deferred.__error_handlers__ = this.__error_handlers__;
    deferred.id = this.id;
    deferred.silentlyCancelled = this.silentlyCancelled;
    return deferred;
};

Deferred.prototype.callbacksFor = function(state) {
    if (state !== RESOLVED && state !== REJECTED && state !== SETTLED) {
        throw new Error('The provided state is not a valid state.');
    }
    
    let list = [];

    for(let [func, $state] of this.chain) {
        if($state === state) {
            list.push(func);
        }
    }

    return list;
};

//Lazy experiment: will need to implement an internal function
//for array-like object checking.
Deferred.prototype.forEach = function (func) {
    this.then(function (array) {
        let len;
        //Determine if the value is an array-like object.
        if(array && typeof (len = array.length) === 'number' && isFinite(len)) {
            //Use a classic for-each loop, as if it is an array-like object,
            //it might not have implemented Symbol.iterator.

            for(let index = 0; index < len; ++index) {
                func(array[index], index, array);
            }
        }

        return array;
    });
}