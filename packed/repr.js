/**
  * @license
  * MochiKit <https://mochi.github.io/mochikit> 
  * Making JavaScript better and easier with a consistent, clean API.
  * Built at "Mon Sep 10 2018 17:22:17 GMT+0100 (British Summer Time)".
  * Command line options: "async base color data datetime dom func iter logging repr"
 */
this.mochikit = this.mochikit || {};
this.mochikit.repr = (function (exports) {
    'use strict';

    function getRepr(object) {
        let repr = object && object.__repr__,
            type = repr ? typeof repr : false;

        return type === 'function'
            ? repr.call(object)
            : type === 'string'
                ? repr
                : null;
    }

    function hasRepr(object) {
        let repr = object && object.__repr__;
        return repr && typeof repr === 'function';
    }

    function registerRepr(obj, val) {
        if(obj) {
            //val + '' = toString call
            return obj.__repr__ = val + '';
        }

        return null;
    }

    function reprArray(array) {
        if(!Array.isArray(array)) {
            throw new Error('Expected an array.');
        }

        return `array(${array.length}) [${array.join(', ')}]`;
    }

    function reprArrayLike(arrayLike) {
        if(!arrayLike || !isFinite(arrayLike.length)) {
            throw new Error('Expected a function');
        }

        return `array-like(${array.length}) [${array.join(', ')}]`;
    }

    function reprFunction(func) {
        if(typeof func !== 'function') {
            throw new Error('Expected a function');
        }

        //Don't allow bogus __repr__ methods pass thru.
        return `function "${func.name}"(${func.length}) ${typeof func.__repr__ === 'function' ? func.__repr__() : `function ${func.name} \{...\}`}`;
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

    function reprGeneric(object) {
        let len = object && typeof object === 'number',
        type = getType(object).slice(8, -1);

        return object ? `${type}${len ? `(${object.length})` : '(void)'} generic-type(${typeof object})` : '(void)(void) generic-type(void)';
    }

    function reprKeys(object) {
        let keys = Object.keys(object);
        return `keys(${keys.length}) { ${keys.join(', ')} }`;
    }

    /**
     * 
     * @param {!Map} map 
     */
    function reprMap(map) {
        let items = '', val;

        for(let key of map.keys()) {
            val = map.get(key);
            items += `${key} => ${val} `;
        }
        return `Map(${map.size}) { ${items.replace(/\s$/, '')} }`;
    }

    /**
     * 
     * @param {!Set} set 
     */
    function reprSet(set) {
        return `Set(${set.size}) [ ${Array.from(set.values())} ]`;
    }

    function reprType(object) {
        let len, hasLen;
        return `${typeof object}${(hasLen = typeof (len = object.length) === 'number') ? `(${len})` : '(void)'}`;
    }

    function stringRepr () {
        return function () {
            return getRepr(this.toString());
        }
    }

    const __repr__ = '[MochiKit.Repr]';

    exports.__repr__ = __repr__;
    exports.getRepr = getRepr;
    exports.hasRepr = hasRepr;
    exports.registerRepr = registerRepr;
    exports.reprArray = reprArray;
    exports.reprArrayLike = reprArrayLike;
    exports.reprFunction = reprFunction;
    exports.reprGeneric = reprGeneric;
    exports.reprKeys = reprKeys;
    exports.reprMap = reprMap;
    exports.reprSet = reprSet;
    exports.reprType = reprType;
    exports.stringRepr = stringRepr;

    return exports;

}({}));
