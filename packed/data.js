/**
        * @license
        * MochiKit <https://mochi.github.io/mochikit> 
        * Making JavaScript better and easier with a consistent, clean API.
        * Built at "Sat Sep 15 2018 22:54:07 GMT+0100 (British Summer Time)".
        * Command line options: "MochiKit async base color data datetime dom func iter logging repr"
       */
this.mochikit = this.mochikit || {};
this.mochikit.data = (function (exports) {
    'use strict';

    function extendWithArray(array, newArray) {
        for(let index = 0, len = array.length; index < len; ++index) {
            newArray.push(array[index]);
        }

        return newArray;
    }

    function arrayLikeToObject(arrayLike) {
        return extendWithArray(arrayLike, {});
    }

    function arrayToList(array, List) {
        let list = new List();

        for(let item of array) {
            list.add(item);
        }

        return list;
    }

    function arrayToSet(array) {
        return arrayToList(array, Set);
    }

    function arrayToWeakSet(array) {
        return arrayToList(array, WeakSet);
    }

    class ChainMap {
        constructor(...maps) {
            //maps = (!Weak)Map();
            this.maps = maps;
            let self = this;
            this.proxy = new Proxy({}, {
                set(obj, prop, value) {
                    self.maps.forEach((map) => map[prop] = value);
                }
            });    
        }
    }

    function cloneArray(array) {
        return extendWithArray(array, []);
    }

    function transformKeyed(keyed, KeyedCollection) {
        let collection = new KeyedCollection();

        for(let [key, set] of keyed.entries()) {
            collection.set(key, set);
        }

        return collection;
    }

    function cloneMap(set) {
        return transformKeyed(set, Map);
    }

    function transformList(list, List) {
        let newList = new List();

        for(let item of list) {
            newList.add(item);
        }

        return newList;
    }

    function cloneSet(set) {
        return transformList(set, Set);
    }

    function mapToWeakMap(map) {
        return transformKeyed(map, WeakMap);
    }

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

    function NamedTuple(defaults = [], repr) {
        return class Tuple extends Set {
            constructor(iterable) {
                super(iterable);

                if(repr == null) {
                    this.__repr__ = function () {
                        return `NamedTuple(${this.size})`;
                    };
                } else {
                    this.__repr__ = repr;
                }

                this.defaults = defaults;
                let len = defaults.length || defaults.size || 0;

                //This might work, not too sure:
                //looks like it would, but I'm not 100% tbch.
                if (len !== 0) {
                    //Allow Sets and Arrays for defaults:
                    let items = list(this.values()),
                    defaultArray = list(defaults),
                    needsFilling = items.length < len;

                    if(needsFilling) {
                        for(let index = items.length - 1; index < len; ++index) {
                            this.add(defaultArray[index]);
                        }
                    }
                }
            }
        };
    }

    function objectToKeyed(object, KeyedCollection) {
        let instance = new KeyedCollection(),
        keys = Object.keys(object);

        for(let key of keys) {
            instance.set(key, object[key]);
        }

        return instance;
    }

    function objectToMap(object) {
        return objectToKeyed(object, Map);
    }

    function objectToWeakMap(object) {
        return objectToKeyed(object, WeakMap);
    }

    function setToWeakSet(set) {
        return transformList(set, WeakSet);
    }

    const __repr__ = '[MochiKit.Data]';

    exports.__repr__ = __repr__;
    exports.arrayLikeToObject = arrayLikeToObject;
    exports.arrayToList = arrayToList;
    exports.arrayToSet = arrayToSet;
    exports.arrayToWeakSet = arrayToWeakSet;
    exports.ChainMap = ChainMap;
    exports.cloneArray = cloneArray;
    exports.cloneMap = cloneMap;
    exports.cloneSet = cloneSet;
    exports.extendWithArray = extendWithArray;
    exports.mapToWeakMap = mapToWeakMap;
    exports.NamedTuple = NamedTuple;
    exports.objectToKeyed = objectToKeyed;
    exports.objectToMap = objectToMap;
    exports.objectToWeakMap = objectToWeakMap;
    exports.setToWeakSet = setToWeakSet;
    exports.transformKeyed = transformKeyed;
    exports.transformList = transformList;

    return exports;

}({}));
