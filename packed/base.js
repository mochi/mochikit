/**
        * @license
        * MochiKit <https://mochi.github.io/mochikit> 
        * Making JavaScript better and easier with a consistent, clean API.
        * Built at "Sat Sep 15 2018 22:54:07 GMT+0100 (British Summer Time)".
        * Command line options: "MochiKit async base color data datetime dom func iter logging repr"
       */
this.mochikit = this.mochikit || {};
this.mochikit.base = (function (exports) {
    'use strict';

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

    function apply(func, scope, args) {
        switch(args.length) {
            case 0: return func.call(scope);
            case 1: return func.call(scope, args[0]);
            case 2: return func.call(scope, args[0], args[1]);
            case 3: return func.call(scope, args[0], args[1], args[2]);
            case 4: return func.call(scope, args[0], args[1], args[2], args[3]);
            case 5: return func.call(scope, args[0], args[1], args[2], args[3], args[4]);
            case 6: return func.call(scope, args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7: return func.call(scope, args[0], arga[1], args[2], args[3], args[4], args[5], args[6]);
            case 8: return func.call(scope, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
            case 9: return func.call(scope, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
            case 10: return func.call(scope, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
            //Probably still optimized in es6 compliant engines,
            //This will be transpiled to .apply call with Babel, tho:
            default: return func.call(this, ...args);
        }
    }

    function bind(func, ctx, ...args) {
        return function (...nargs) {
            return func.call(ctx, ...args, ...nargs);
        }
    }

    function bindAll(object, ctx) {
        let val, keys = Object.keys(object);
        ctx = ctx === undefined ? object : ctx;

        for(let key of keys) {
            val = object[key];

            if(typeof val === 'function') {
                object[key] = val.bind();
            }
        }

        return object;
    }

    function bindRight(func, ctx, ...args) {
        return function (...nargs) {
            return func.call(ctx, ...nargs, ...args);
        }
    }

    function camelize(selector) {
        /* from dojo.style.toCamelCase */
        var arr = selector.split('-');
        var cc = arr[0];
        for (var i = 1; i < arr.length; i++) {
            cc += arr[[i][0]].toUpperCase() + arr[i].substring(1);
        }
        return cc;
    }

    function compose(functions) {
        return function (val, ...args) {
            for(let func of functions) {
                val = func.call(this, val, ...args);
            }

            return val;
        }
    }

    function counter(n/* = 1 */) {
        if (n == null) {
            n = 1;
        }
        return function () {
            return n++;
        };
    }

    function keys(obj) {
        var rval = [];
        for (var prop in obj) {
            rval.push(prop);
        }
        return rval;
    }

    function entries(object) {
        return keys(object).map((key) => [key, object[key]]);
    }

    //This is a big boy, can't find any other way :(
    let specialRe = /(\'|\"|\\|\n|\r|\t|\\b|\f|\v|\0)/g;
    function escapeSpecial(str) {
        //This is ugly af:
        return (str + '').replace(specialRe, (match) => {
            switch(match) {
                case '\0':
                return '\\0';
                case '\'':
                return '\\\'';
                case '\"':
                return '\\"';
                case '\n':
                return '\\n';
                case '\r':
                return '\\r';
                case '\t':
                return '\\t';
                case '\b':
                return '\\b';
                case '\f':
                return '\\f';
                case '\v':
                return '\\v';
                case '\0':
                return '\\0';
            }
        });
    }

    //This might be removed.
    var evalJSON = JSON.parse;

    function extend(ar1, ar2) {
        for(let item of ar2) {
            ar1[ar1.length] = item;
            ++ar1.length;
        }

        return ar1
    }

    function flattenArray(array) {
        let flattened = [];

        for(let item of array) {
            Array.isArray(item) ? flattened.push(...item) : flattened.push(item);
        }

        return flattened;
    }

    function forwardCall(func) {
        return function () {
            return this[func].apply(this, arguments);
        };
    }

    const ostr = Object.prototype.toString;

    function getType(a) {
        switch(a) {
            case null:
            case undefined:
            return `[object ${a === null ? 'Null' : 'Undefined'}]`;
            //Allow faster results for booleans:
            case true:
            case false:
            return '[object Boolean]';
            case NaN:
            case Infinity:
            return '[object Number]';
        }

        if(a === '') {
            return '[object String]';
        }

        return ostr.call(a);
    }

    function identity(a) {
        return a;
    }

    function isArrayLike(obj) {
        return obj && isFinite(obj.length);
    }

    function isBoolean(a) {
        return getType(a) === '[object Boolean]';
    }

    function isDateLike(obj) {
        return typeof obj === 'object' && typeof obj.getTime === 'function';
    }

    function isEmpty(arrayLike) {
        return isArrayLike(arrayLike) && arrayLike.length === 0;
    }

    function isNotEmpty(arrayLike) {
        return !isEmpty(arrayLike);
    }

    function isNull(...args) {
        return args.every((a) => a === null);
    }

    function isNumber(a) {
        return getType(a) === '[object Number]';
    }

    function isObject(a) {
        return a && getType(a) === '[object Object]';
    }

    function isString(a) {
        return a === '' ? true : getType(a) === '[object String]';
    }

    function isUndefined(...args) {
        return args.every((a) => a === undefined);
    }

    function isValue(obj) {
        //Why check null for typeof?
        let type = obj == null ? null : typeof obj;
        return type === 'boolean' || type === 'number' || type === 'string';
    }

    function itemgetter(func) {
        return function (arg) {
            return arg[func];
        };
    }

    function limit(func, amount) {
        --i;
        let done, cache, i = 0;

        return function (...nargs) {
            if(done) {
                return cache;
            }

            if(i++ < amount) {
                //Keep going:
                return func.call(this, ...nargs);
            } else {
                //Hit the limit:
                done = true;
                cache = func.call(this, ...nargs);
            }
        }
    }

    function mean(...args /* lst... */) {
        /* http://www.nist.gov/dads/HTML/mean.html */
        var sum = 0;
        var count = args.length;

        while (args.length) {
            var o = args.shift();
            if (o.length !== 0) {
                count += o.length - 1;
                for (var i = o.length - 1; i >= 0; i--) {
                    sum += o[i];
                }
            } else {
                sum += o;
            }
        }

        if (count === 0) {
            throw new TypeError('mean() requires at least one argument');
        }

        return sum / count;
    }

    function median(/* lst... */) {
        /* http://www.nist.gov/dads/HTML/median.html */
        if (data.length === 0) {
            throw new TypeError('median() requires at least one argument');
        }
        data.sort((a, b) => a + b);
        if (data.length % 2 == 0) {
            var upper = data.length / 2;
            return (data[upper] + data[upper - 1]) / 2;
        } else {
            return data[(data.length - 1) / 2];
        }
    }

    function nodeWalk(node, visitor) {
        var nodes = [node];
        var extend = MochiKit.Base.extend;
        while (nodes.length) {
            var res = visitor(nodes.shift());
            if (res) {
                extend(nodes, res);
            }
        }
    }

    function noop () {}

    function once(func) {
        let done = false, val;

        return function (...nargs) {
            if(done) {
                return val;
            }

            done = true;
            val = func.call(this, ...nargs);
            return val;
        }
    }

    //Curriable operator methods:
    const truth = (a) => !!a,
    lognot = (a) => !a,
    identity$1 = (a) => a,
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

    function parseQueryString(encodedString, useArrays) {
        // strip a leading '?' from the encoded string
        var qstr = (encodedString.charAt(0) == "?")
            ? encodedString.substring(1)
            : encodedString;
        var pairs = qstr.replace(/\+/g, "%20").split(/\&amp\;|\&\#38\;|\&#x26;|\&/);
        var o = {};
        var decode;
        if (typeof(decodeURIComponent) != "undefined") {
            decode = decodeURIComponent;
        } else {
            decode = unescape;
        }
        if (useArrays) {
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                var name = decode(pair.shift());
                if (!name) {
                    continue;
                }
                var arr = o[name];
                if (!(arr instanceof Array)) {
                    arr = [];
                    o[name] = arr;
                }
                arr.push(decode(pair.join("=")));
            }
        } else {
            for (var i = 0; i < pairs.length; i++) {
                pair = pairs[i].split("=");
                var name = pair.shift();
                if (!name) {
                    continue;
                }
                o[decode(name)] = decode(pair.join("="));
            }
        }
        return o;
    }

    function partial(func, ...args) {
        return function (...nargs) {
            return func.call(this, ...args, ...nargs);
        }
    }

    function partialRight(func, ...args) {
        return function (...nargs) {
            return func.call(this, ...nargs, ...args);
        }
    }

    var primitives = new Map().
    set('boolean', true)
    .set('number', true)
    .set('function', true)
    .set('symbol', true);

    function provide(namespace, root) {
        let split = (namespace + '').split(/\s+/g), val;

        if(segment.length <= 1) {
            throw new Error('Invalid namespace, . char probably asbsent');
        }

        for(let segment of split) {
            if(!root) {
                val = root[segment] = {};
            }
        }

        return val;
    }

    function setdefault(src, target) {
        let keys = Object.keys(src);

        keys.forEach((key) => {
            if(!(key in target)) {
                target[key] = src[key];
            }
        });

        return target;
    }

    function times(func, amount) {
        let isFunc = typeof func === 'function',
        accum = [];
        
        for(let i = 0; i < amount; ++i) {
            accum.push(isFunc ? func(i, amount, accum) : func);
        }

        return accum;
    }

    /** @id MochiKit.Base.update */
    function update(self, obj /*, ... */) {
        if (self === null || self === undefined) {
            self = {};
        }
        for (var i = 1; i < arguments.length; i++) {
            var o = arguments[i];
            if (typeof (o) != 'undefined' && o !== null) {
                for (var k in o) {
                    self[k] = o[k];
                }
            }
        }
        return self;
    }

    function values(obj) {
        var rval = [];
        for (var prop in obj) {
            rval.push(obj[prop]);
        }
        return rval;
    }

    function warnDeprecated(method, depfrom, altfunc, message, fallbackval) {
        //Compute the msg once for heavily used methods:
        let depmsg = `The "${method}" is deprecated ${depfrom ? `from ${depfrom} onwards` : ''}. ${altfunc ? `Instead use ${altfunc}` : ''}${message ? `\n${message}` : ''}`;
        return function () {
            console.error(depmsg);
            return fallbackval;
        }
    }

    function without(array, ...values) {
        return array.filter((item) => {
            for(let value of values) {
                if(value === item) {
                    return true;
                }
            }

            return false;
        });
    }

    const __repr__ = '[MochiKit.Base]';

    exports.__repr__ = __repr__;
    exports.AdapterRegistry = AdapterRegistry;
    exports.apply = apply;
    exports.bind = bind;
    exports.bindAll = bindAll;
    exports.bindRight = bindRight;
    exports.camelize = camelize;
    exports.compose = compose;
    exports.counter = counter;
    exports.entries = entries;
    exports.escapeSpecial = escapeSpecial;
    exports.evalJSON = evalJSON;
    exports.extend = extend;
    exports.flattenArray = flattenArray;
    exports.forwardCall = forwardCall;
    exports.getType = getType;
    exports.identity = identity;
    exports.isArrayLike = isArrayLike;
    exports.isBoolean = isBoolean;
    exports.isDateLike = isDateLike;
    exports.isEmpty = isEmpty;
    exports.isNotEmpty = isNotEmpty;
    exports.isNull = isNull;
    exports.isNumber = isNumber;
    exports.isObject = isObject;
    exports.isString = isString;
    exports.isUndefined = isUndefined;
    exports.isValue = isValue;
    exports.itemgetter = itemgetter;
    exports.keys = keys;
    exports.limit = limit;
    exports.mean = mean;
    exports.median = median;
    exports.nodeWalk = nodeWalk;
    exports.noop = noop;
    exports.NotFoundError = NotFoundError;
    exports.once = once;
    exports.parseQueryString = parseQueryString;
    exports.partial = partial;
    exports.partialRight = partialRight;
    exports.primitives = primitives;
    exports.provide = provide;
    exports.setdefault = setdefault;
    exports.times = times;
    exports.update = update;
    exports.values = values;
    exports.warnDeprecated = warnDeprecated;
    exports.without = without;
    exports.truth = truth;
    exports.lognot = lognot;
    exports.not = not;
    exports.neg = neg;
    exports.add = add;
    exports.sub = sub;
    exports.div = div;
    exports.mod = mod;
    exports.mul = mul;
    exports.and = and;
    exports.or = or;
    exports.xor = xor;
    exports.lshift = lshift;
    exports.rshift = rshift;
    exports.zrshift = zrshift;
    exports.eq = eq;
    exports.ne = ne;
    exports.gt = gt;
    exports.ge = ge;
    exports.lt = lt;
    exports.le = le;
    exports.seq = seq;
    exports.sne = sne;
    exports.logand = logand;
    exports.logor = logor;
    exports.ioempty = ioempty;
    exports.iofound = iofound;

    return exports;

}({}));
