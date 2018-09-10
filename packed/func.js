/**
  * @license
  * MochiKit <https://mochi.github.io/mochikit> 
  * Making JavaScript better and easier with a consistent, clean API.
  * Built at "Mon Sep 10 2018 17:22:17 GMT+0100 (British Summer Time)".
  * Command line options: "async base color data datetime dom func iter logging repr"
 */
this.mochikit = this.mochikit || {};
this.mochikit.func = (function (exports) {
    'use strict';

    function arity(func, amount) {
        switch (amount) {
            case 0:
                return function() {
                    return func.call(this);
                };
            case 1:
                return function($a) {
                    return func.call(this, $a);
                };
            case 2:
                return function($a, $b) {
                    return func.call(this, $a, $b);
                };
            case 3:
                return function($a, $b, $c) {
                    return func.call(this, $a, $b, $c);
                };
            case 4:
                return function($a, $b, $c, $d) {
                    return func.call(this, $a, $b, $c, $d);
                };
            case 5:
                return function($a, $b, $c, $d, $e) {
                    return func.call(this, $a, $b, $c, $d, $e);
                };
            case 6:
                return function($a, $b, $c, $d, $e, $f) {
                    return func.call(this, $a, $b, $c, $d, $e, $f);
                };
            case 7:
                return function($a, $b, $c, $d, $e, $f, $g) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g);
                };
            case 8:
                return function($a, $b, $c, $d, $e, $f, $g, $h) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h);
                };
            case 9:
                return function($a, $b, $c, $d, $e, $f, $g, $h, $i) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h, $i);
                };
            case 10:
                return function($a, $b, $c, $d, $e, $f, $g, $h, $i, $j) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h, $i, $j);
                };

            default:
                throw new Error('Out of range');
        }
    }

    function copyFunction(func) {
        return function (...args) {
            return func.call(this, ...args);
        }
    }

    function ctor (classFunc) {
        return new classFunc();
    }

    function everyArg(func) {
        return function (...args) {
            let cache, i = 0, len = args.length;

            for(; i < len; ++i) {
                if(!func.call(this, args, cache)) {
                    return false;
                }
            }

            //Prevent empty args from passing:
            return len !== 0;
        }
    }

    function flip(func) {
        return function (...args) {
            return func.call(this, ...args.reverse());
        }
    }

    function pipe(func, ...functions) {
        return function (val, ...args) {
            for(let func of functions) {
                val = func.call(this, val, ...args);
            }

            return val;
        }
    }

    function flow(functions) {
        return pipe(functions[0], ...functions.slice(1));
    }

    function invert(func) {
        return function (...args) {
            return !func.call(this, ...args);
        }
    }

    function mapCtors(...ctors) {
        return ctors.map(ctor);
    }

    function nodeCallback(func, onerror) {
        return function (err, ...data) {
            if(err) {
                onerror(err, data);
            } else {
                func(...data);
            }
        }
    }

    function passArgs(func) {
        return function (...args) {
            return func.call(this, args);
        }
    }

    function passTimes(func) {
        let times = -1; 
        return function (...args) {
            return func.call(this, times, args);
        }
    }

    function step(...functions) {
        let i = 0, cache, run = length === i, {length} = functions; 
        return function (...args) {
            if(!run || i >= length) {
                return cache;
            }

            cache = functions[i].call(this, args, cache);
            ++i;
            return cache;
        }
    }

    function stepRight(...functions) {
        return step(...functions.reverse());
    }

    function unary(func) {
        return function (val) {
            return func.call(this, val);
        }
    }

    function wrap(value, func) {
        return function (...args) {
            return func.call(this, value, ...args);
        }
    }

    const __repr__ = '[MochiKit.Func]';

    exports.__repr__ = __repr__;
    exports.arity = arity;
    exports.copyFunction = copyFunction;
    exports.ctor = ctor;
    exports.everyArg = everyArg;
    exports.flip = flip;
    exports.flow = flow;
    exports.invert = invert;
    exports.mapCtor = mapCtors;
    exports.nodeCallback = nodeCallback;
    exports.passArgs = passArgs;
    exports.passTimes = passTimes;
    exports.pipe = pipe;
    exports.step = step;
    exports.stepRight = stepRight;
    exports.unary = unary;
    exports.wrap = wrap;

    return exports;

}({}));
