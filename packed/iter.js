/**
  * @license
  * MochiKit <https://mochi.github.io/mochikit> 
  * Making JavaScript better and easier with a consistent, clean API.
  * Built at "Mon Sep 10 2018 17:22:17 GMT+0100 (British Summer Time)".
  * Command line options: "async base color data datetime dom func iter logging repr"
 */
this.mochikit = this.mochikit || {};
this.mochikit.iter = (function (exports) {
    'use strict';

    function isIterator(object) {
        return object && typeof object.next === 'function';
    }

    function iextend(accumulator, iter) {
        let value,
        cachedValue,
        done = isIterator(iter) ? iter.done : true;

        while(!done) {
            value = (cachedValue = iter.next()) === iter ? iter.value : cachedValue;
            accumulator.push(value);
            done = iter.done;
        }

        return accumulator;
    }

    //Like .exhaust but collects results:
    function list(iter) {
        return iextend([], iter);
    }

    //The original Iter/some.
    function any(iter, predicate) {
        return list(iter).some(predicate);
    }

    function applyMap(func, items) {
        for(let item of items) {
            func.call(this, item);
        }
    }

    class ArrayIterator {
        constructor(array) {
            this.array = array;
            this.done = false;
            this.index = 0;
        }

        next() {
            if(!this.done) {
                let {array, index} = this;
                //Could be an empty array,
                //or iteration is done:
                if(index >= array.length) {
                    this.done = true;
                } else {
                    this.value = array[index];
                    ++this.index;
                }
            }

            return this;
        }

        __repr__() {
            return `ArrayIterator(index = ${this.index}, done = ${this.done}, length = ${this.array.length})`;
        }
    }

    function arrayLikeIter(arrayLike) {
        return new ArrayIterator(arrayLike);
    }

    //Not used by MochiKit, but might be used elsewhere (?).
    var StopIteration = new Error('StopIteration');

    function breakOldLoop() {
        throw StopIteration;
    }

    class CycleIterator {
        constructor(...items) {
            this.items = items;
            this.index = 0;
        }

        next() {
            let {index} = this;
            if(index >= this.items.length) {
                //Reset index.
                this.index = 0;
            }

            this.value = this.items[index];

            return this;
        }

        __repr__() {
            return `CycleIterator(index = ${this.index}, length = ${this.items.length})`;
        }
    }

    function chain(...items) {
        return new CycleIterator(...items);
    }

    class CountIterator {
        constructor(n = 0) {
            this.n = n;
            this.done = false;
        }
        
        next() {
            this.value = this.n;
            return this;
        }
        
        __repr__() {
            return `CountIterator(n = ${this.n}, done = ${this.done})`;
        }
    }

    function count(n /* = 0 */) {
        return new CountIterator(n);
    }

    function cycle(items) {
        return new CycleIterator(...items);
    }

    class EveryIterator {
        constructor(array, predicate) {
            this.array = array;
            this.predicate = predicate;
            this.index = 0;
        }

        next() {
            if(!this.done) {
                let {array, index, predicate} = this,
                item = array[index];
                
                this.done = predicate(item, index, array);
            }

            return this;
        }

        __repr__() {
            return `EveryIterator(...)`;
        }
    }

    function every(array, predicate) {
        return new EveryIterator(array, predicate);
    }

    function exhaust(iter) {
        let done = isIterator(iter) ? iter.done : true;

        while(!done) {
            iter.next();
            done = iter.done;
        }
    }

    function exhaustLimited(iter, limit) {
        let index = 0, done = isIterator(iter) ? iter.done : true;

        while(done && index < limit) {
            iter.next();
            ++index;
            done = iter.done;
        }

        return iter;
    }

    function forEach(iter, predicate) {
        let value, cachedValue, index = 0, done = isIterator(iter) ? iter.done : true;

        while(!done) {
            //Add support for generators that don't return the value.
            value = (cachedValue = iter.next()) === iter ? cachedValue : iter.value;
            predicate(value, index);
            done = iter.done;
            ++index;
        }

        return iter; 
    }

    class GenIterator {
        constructor(generator) {
            this.generator = generator;
            this.done = generator.done;
            this.value = generator.value;
        }

        __repr__() {
            return `GenIterator(done = ${this.done})`;
        }

        next() {
            this.generator.next();
            this.done = this.generator.done;
            this.value = this.generator.value;
            return this;
        }    
    }

    function genToIter(generator) {
        return new GenIterator(generator);
    }

    function guardIterator(itr, guard) {
        if(isIterator(itr)) {
            let oldNext = itr.next;
            //Add generator support:
            itr.next = function (...args) {
                oldNext.call(this, ...args);
                guard.call(this, ...args);
            };
        }

        //pass thru, isn't iterator
        return null;
    }

    function hasSymbolIterator(obj) {
        return obj && typeof obj[Symbol.iterator] === 'function';
    }

    function ifilter(iter, predicate) {
        let index = 0,
        filtered = [],
        array = list(iter);

        for(let item of array) {
            if(predicate(item, index, array) == true) {
                filtered.push(item);
            }

            ++index;
        }

        return arrayLikeIter(filtered);
    }

    function ifilter$1(iter, predicate) {
        let index = 0,
        filtered = [],
        array = list(iter);

        for(let item of array) {
            if(predicate(item, index, array) === false) {
                filtered.push(item);
            }

            ++index;
        }

        return arrayLikeIter(filtered);
    }

    class PipedIterator {
        constructor(iter, pipeFunction) {
            this.pipeFunction = pipeFunction;
            this.iter = iter;
            this.done = iter.done;

            //Try to use the iter's __repr__ if possible.
            if (typeof iter.__repr__ === 'function') {
                this.__repr__ = function() {
                    return this.iter.__repr__();
                };
            }
        }

        next() {
            if (!this.done) {
                this.value = this.pipeFunction(this.iter.next(), this.iter, this);
                this.done = this.iter.done;
            }
            return this;
        }

        __repr__() {
            return `PipedIterator(...)`;
        }
    }

    function pipeNext(iter, pipeFunction) {
        return new PipedIterator(iter, pipeFunction);
    }

    //Curriable operator methods:
    const truth = (a) => !!a,
    lognot = (a) => !a,
    identity = (a) => a,
    not = (a) => ~a,
    neg = (a) => -a,
    add = (a, b) => a + b,
    sub = (a, b) => a - b,
    div = (a, b) => a / b,
    mod = (a, b) => a % b,
    mul = (a, b) => a * b,
    and = (a, b) => a && b,
    or = (a, b) => a || b,
    xor = (a, b) => a ^ b,
    lshift = (a, b) => a << b,
    rshift = (a, b) => a >> b,
    zrshift = (a, b)=> a >>> b,
    eq = (a, b) => a == b,
    ne = (a, b) => a != b,
    gt = (a, b) => a > b,
    ge = (a, b) => a >= b,
    lt = (a, b) => a < b,
    le = (a, b) => a <= b,
    seq = (a, b) => a === b,
    sne = (a, b) => a !== b,
    // ceq,
    // cne,
    // cgt,
    // cge,
    // clt,
    // cle
    //Think the docs got these wrong:
    logand = (a, b) => a & b,
    logor = (a, b) => a | b,

    //Useful for indexOf
    ioempty = (a) => a === -1,
    iofound = (a) => a !== -1;

    function pipe(func) {
        return function iterOperator(iter) {
            return pipeNext(iter, func);
        };
    }

    const iadd = pipe(add),
    iand = pipe(and),
    idiv = pipe(div),
    ieq = pipe(eq),
    ige = pipe(ge),
    igt = pipe(gt),
    //TODO: maybe change? this looks a bit weird
    iidentity = pipe(identity),
    iioempty = pipe(ioempty),
    iiofound = pipe(iofound),
    ile = pipe(le),
    ilogand = pipe(logand),
    ilognot = pipe(lognot),
    ilogor = pipe(logor),
    ilshift = pipe(lshift),
    ilt = pipe(lt),
    imod = pipe(mod),
    imul = pipe(mul),
    ine = pipe(ne),
    ineg = pipe(neg),
    inot = pipe(not),
    ior = pipe(or),
    irshift = pipe(rshift),
    iseq = pipe(seq),
    isne = pipe(sne),
    isub = pipe(sub),
    itruth = pipe(truth),
    ixor = pipe(xor),
    izrshift = pipe(zrshift);

    function islice(iter, start, stop) {
        return list(iter).slice(start, stop);
    }

    class NotFoundError extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'NotFoundError';
        }
    }

    class AdapterRegistry {
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

    function getRepr(object) {
        let repr = object && object.__repr__,
            type = repr ? typeof repr : false;

        return type === 'function'
            ? repr.call(object)
            : type === 'string'
                ? repr
                : null;
    }

    function iter(iterable, /* optional */ sentinel) {
        if (arguments.length >= 2) {
            return self.takewhile(
                function (a) { return a != sentinel; },
                iterable
            );
        }
        if (typeof(iterable.next) == 'function') {
            return iterable;
        } else if (typeof(iterable.iter) == 'function') {
            return iterable.iter();
        }

        //TODO: make AdapterRegistry not throw on error.
        try {
            return iter.registry.match(iterable);
        } catch(err) {
            if(err instanceof NotFoundError) {
                throw new TypeError(`${getRepr(iterable)} is not iterable (not found in registry).`);
            }

            throw err;
        }
    }

    iter.registry = new AdapterRegistry();

    function itimes(iter, amount) {
        return pipeNext(iter, (value) => value * amount);
    }

    class KeyIterator extends ArrayIterator {
        constructor(object) {
            super(Object.keys(object));
        } 

        __repr__() {
            return `KeyIterator(size = ${this.array.length}, done = ${this.done}, index = ${this.index})`;
        }
    }

    function keyIterator(object) {
        return new KeyIterator(object);
    }

    class RangeIterator {
        constructor(start, end) {
            this.start = start;
            this.end = end;
            this.done = false;
            this.index = start;
        }

        next() {
            if(!this.done) {
                //Check if we hit the end index.
                if(this.index >= this.end) {
                    this.done = true;
                } else {
                    this.value = ++this.index;
                }
            }

            return this;
        }

        __repr__() {
            return `RangeIterator(start = ${this.start}, end = ${this.end}, done = ${this.done})`;
        }
    }

    function range(start, end) {
        return new RangeIterator(start, end);
    }

    function reduceArrayLike(array, predicate, accumulator) {
        let index = 0;

        if(accumulator === undefined) {
            index = 1;
            accumulator = array[0];
        }

        for(let item of array) {
            accumulator = predicate(accumulator, item);
        }

        return accumulator;
    }

    function reduceIter(iter) {
        return reduceArrayLike(list(iter));
    }

    class RepeatIterator {
        constructor(value) {
            this.value = value;
            this.done = false;
        }

        next() {
            //No-op, value is already set.
            return this;
        }

        __repr__() {
            return `RepeatIterator(done = ${this.done})`;
        }
    }

    function repeat(value) {
        return new RepeatIterator(value);
    }

    function reversed(iter) {
        return list(iter).reverse();
    }

    class SomeIterator {
        constructor(array, predicate) {
            this.index = 0;
            this.array = array;
            this.done = false;
            this.predicate = predicate;
        }

        next() {
            if(!this.done) {
                if(this.index >= this.array.length) {
                    //Done.
                    this.done = true;
                } else {
                    let {array, index, predicate} = this,
                    item = array[index];

                    this.value = predicate(item, index, array, this);
                }
            }

            return this;
        }

        __repr__() {
            return `SomeIterator(done = ${this.done}, index = ${this.index})`;
        }
    }

    function some(array, predicate) {
        return new SomeIterator(array, predicate);
    }

    function sortedArrayLike(arrayLike, sortMethod) {
        //TODO: make sort function
        return Array.from(arrayLike).sort(sortMethod);
    }

    function sortedArrayLikeIter(arrayLike, comparator) {
        return new ArrayIterator(sortedArrayLike(arrayLike, comparator));
    }

    function sorted(iter, comparator) {
        return list(iter).sort(comparator);
    }

    function sumArrayLike(arrayLike) {
        let sum;

        for(let num of arrayLike) {
            if(sum !== sum) {
                //isNaN(sum). Break;
                return sum;
            }

            sum += num;
        }

        return sum;
    }

    function sumArrayLikeClamped(arr, min, max) {
        let result = sumArrayLike(arr);
        //TODO: make Base.clamp
        return result > max ? max : result < min ? min : result;
    }

    function sumIter(iter) {
        return sumArrayLike(list(iter));
    }

    function sumIterClamped(iter) {
        return sumArrayLikeClamped(list(iter));
    }

    class ValueIterator extends ArrayIterator {
        constructor(object) {
            //TODO: make Base.values function
            super(Object.keys(object).map((a) => object[a]));
        }

        __repr__() {
            return `ValueIterator(size = ${this.array.length}, done = ${this.done}, index = ${this.index})`;
        }
    }

    function valueIterator(object) {
        return new ValueIterator(object);
    }

    const __repr__ = '[MochiKit.Iter]';

    exports.__repr__ = __repr__;
    exports.any = any;
    exports.applyMap = applyMap;
    exports.ArrayIterator = ArrayIterator;
    exports.arrayLikeIter = arrayLikeIter;
    exports.breakOldLoop = breakOldLoop;
    exports.chain = chain;
    exports.count = count;
    exports.CountIterator = CountIterator;
    exports.cycle = cycle;
    exports.CycleIterator = CycleIterator;
    exports.every = every;
    exports.EveryIterator = EveryIterator;
    exports.exhaust = exhaust;
    exports.exhaustLimited = exhaustLimited;
    exports.forEach = forEach;
    exports.GenIterator = GenIterator;
    exports.genToIterator = genToIter;
    exports.guardIterator = guardIterator;
    exports.hasSymbolIterator = hasSymbolIterator;
    exports.iextend = iextend;
    exports.ifilter = ifilter;
    exports.ifilterfalse = ifilter$1;
    exports.isIterable = hasSymbolIterator;
    exports.isIterator = isIterator;
    exports.islice = islice;
    exports.iter = iter;
    exports.itimes = itimes;
    exports.KeyIterator = KeyIterator;
    exports.keyIterator = keyIterator;
    exports.list = list;
    exports.PipedIterator = PipedIterator;
    exports.pipeNext = pipeNext;
    exports.range = range;
    exports.RangeIterator = RangeIterator;
    exports.reduceArrayLike = reduceArrayLike;
    exports.reduceIter = reduceIter;
    exports.repeat = repeat;
    exports.RepeatIterator = RepeatIterator;
    exports.reversed = reversed;
    exports.some = some;
    exports.SomeIterator = SomeIterator;
    exports.sortedArrayLike = sortedArrayLike;
    exports.sortedArrayLikeIter = sortedArrayLikeIter;
    exports.sortedIter = sorted;
    exports.StopIteration = StopIteration;
    exports.sumArrayLike = sumArrayLike;
    exports.sumArrayLikeClamped = sumArrayLikeClamped;
    exports.sumIter = sumIter;
    exports.sumIterClamped = sumIterClamped;
    exports.ValueIterator = ValueIterator;
    exports.ival = valueIterator;
    exports.iadd = iadd;
    exports.iand = iand;
    exports.idiv = idiv;
    exports.ieq = ieq;
    exports.ige = ige;
    exports.igt = igt;
    exports.iidentity = iidentity;
    exports.iioempty = iioempty;
    exports.iiofound = iiofound;
    exports.ile = ile;
    exports.ilogand = ilogand;
    exports.ilognot = ilognot;
    exports.ilogor = ilogor;
    exports.ilshift = ilshift;
    exports.ilt = ilt;
    exports.imod = imod;
    exports.imul = imul;
    exports.ine = ine;
    exports.ineg = ineg;
    exports.inot = inot;
    exports.ior = ior;
    exports.irshift = irshift;
    exports.iseq = iseq;
    exports.isne = isne;
    exports.isub = isub;
    exports.itruth = itruth;
    exports.ixor = ixor;
    exports.izrshift = izrshift;

    return exports;

}({}));
