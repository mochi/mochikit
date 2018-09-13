this.mochikit=this.mochikit||{},this.mochikit.base=function(n){"use strict";function t(n,t){switch(t.length){case 0:return n.call(this);case 1:return n.call(this,t[0]);case 2:return n.call(this,t[0],t[1]);case 3:return n.call(this,t[0],t[1],t[2]);case 4:return n.call(this,t[0],t[1],t[2],t[3]);case 5:return n.call(this,t[0],t[1],t[2],t[3],t[4]);case 6:return n.call(this,t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return n.call(this,t[0],arga[1],t[2],t[3],t[4],t[5],t[6]);case 8:return n.call(this,t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7]);case 9:return n.call(this,t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8]);case 10:return n.call(this,t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9]);default:return n.call(this,...t)}}function r(n,t,...r){return function(...e){return n.call(t,...r,...e)}}function e(n,t){let r,e=Object.keys(n);t=void 0===t?n:t;for(let t of e)"function"==typeof(r=n[t])&&(n[t]=r.bind());return n}function i(n,t,...r){return function(...e){return n.call(t,...e,...r)}}function u(n){for(var t=n.split("-"),r=t[0],e=1;e<t.length;e++)r+=t[[e][0]].toUpperCase()+t[e].substring(1);return r}function o(n){return function(t,...r){for(let e of n)t=e.call(this,t,...r);return t}}function c(n){return null==n&&(n=1),function(){return n++}}function a(n){var t=[];for(var r in n)t.push(r);return t}function f(n){return a(n).map(t=>[t,n[t]])}function s(n){return(n+"").replace(W,n=>{switch(n){case"\0":return"\\0";case"'":return"\\'";case'"':return'\\"';case"\n":return"\\n";case"\r":return"\\r";case"\t":return"\\t";case"\b":return"\\b";case"\f":return"\\f";case"\v":return"\\v";case"\0":return"\\0"}})}function l(n,t){for(let r of t)n[n.length]=r,++n.length;return n}function h(n){let t=[];for(let r of n)Array.isArray(r)?t.push(...r):t.push(r);return t}function p(n){return function(){return this[n].apply(this,arguments)}}function d(n){switch(n){case null:case void 0:return`[object ${null===n?"Null":"Undefined"}]`;case!0:case!1:return"[object Boolean]";case NaN:case 1/0:return"[object Number]"}return""===n?"[object String]":H.call(n)}function g(n){return n}function v(n){return n&&isFinite(n.length)}function b(n){return"[object Boolean]"===d(n)}function m(n){return"object"==typeof n&&"function"==typeof n.getTime}function y(n){return v(n)&&0===n.length}function j(n){return!y(n)}function w(...n){return n.every(n=>null===n)}function N(n){return"[object Number]"===d(n)}function k(n){return n&&"[object Object]"===d(n)}function E(n){return""===n||"[object String]"===d(n)}function A(...n){return n.every(n=>void 0===n)}function S(n){let t=null==n?null:typeof n;return"boolean"===t||"number"===t||"string"===t}function O(n){return function(t){return t[n]}}function B(n,t){--i;let r,e,i=0;return function(...u){return r?e:i++<t?n.call(this,...u):(r=!0,void(e=n.call(this,...u)))}}function R(...n){for(var t=0,r=n.length;n.length;){var e=n.shift();if(0!==e.length){r+=e.length-1;for(var i=e.length-1;i>=0;i--)t+=e[i]}else t+=e}if(0===r)throw new TypeError("mean() requires at least one argument");return t/r}function U(){if(0===data.length)throw new TypeError("median() requires at least one argument");if(data.sort((n,t)=>n+t),data.length%2==0){var n=data.length/2;return(data[n]+data[n-1])/2}return data[(data.length-1)/2]}function q(n,t){for(var r=[n],e=MochiKit.Base.extend;r.length;){var i=t(r.shift());i&&e(r,i)}}function x(){}function C(n){let t,r=!1;return function(...e){return r?t:(r=!0,t=n.call(this,...e))}}function T(n,t){var r,e=("?"==n.charAt(0)?n.substring(1):n).replace(/\+/g,"%20").split(/\&amp\;|\&\#38\;|\&#x26;|\&/),i={};if(r="undefined"!=typeof decodeURIComponent?decodeURIComponent:unescape,t)for(c=0;c<e.length;c++){var u=e[c].split("=");if(a=r(u.shift())){var o=i[a];o instanceof Array||(o=[],i[a]=o),o.push(r(u.join("=")))}}else for(var c=0;c<e.length;c++){var a=(u=e[c].split("=")).shift();a&&(i[r(a)]=r(u.join("=")))}return i}function _(n,...t){return function(...r){return n.call(this,...t,...r)}}function F(n,...t){return function(...r){return n.call(this,...r,...t)}}function I(n,t){let r,e=(n+"").split(/\s+/g);if(segment.length<=1)throw new Error("Invalid namespace, . char probably asbsent");for(let n of e)t||(r=t[n]={});return r}function M(n,t){return Object.keys(n).forEach(r=>{r in t||(t[r]=n[r])}),t}function z(n,t){let r="function"==typeof n,e=[];for(let i=0;i<t;++i)e.push(r?n(i,t,e):n);return e}function D(n,t){null!==n&&void 0!==n||(n={});for(var r=1;r<arguments.length;r++){var e=arguments[r];if(void 0!==e&&null!==e)for(var i in e)n[i]=e[i]}return n}function J(n){var t=[];for(var r in n)t.push(n[r]);return t}function K(n,t,r,e,i){let u=`The "${n}" is deprecated ${t?`from ${t} onwards`:""}. ${r?`Instead use ${r}`:""}${e?`\n${e}`:""}`;return function(){return console.error(u),i}}function L(n,...t){return n.filter(n=>{for(let r of t)if(r===n)return!0;return!1})}class Q extends Error{constructor(n){super(n),this.name="NotFoundError"}}class V{constructor(){this.pairs=[]}register(n,t,r,e){e?this.pairs.unshift([n,t,r]):this.pairs.push([n,t,r])}match(){for(var n=0;n<this.pairs.length;n++){var t=this.pairs[n];if(t[1].apply(this,arguments))return t[2].apply(this,arguments)}throw new Q}unregister(n){for(var t=0;t<this.pairs.length;t++)if(this.pairs[t][0]==n)return this.pairs.splice(t,1),!0;return!1}}let W=/(\'|\"|\\|\n|\r|\t|\\b|\f|\v|\0)/g;var G=JSON.parse;const H=Object.prototype.toString,P=n=>!!n,X=n=>!n,Y=(n=>n,n=>~n),Z=n=>-n,$=(n,t)=>n+t,nn=(n,t)=>n-t,tn=(n,t)=>n/t,rn=(n,t)=>n%t,en=(n,t)=>n*t,un=(n,t)=>n&&t,on=(n,t)=>n||t,cn=(n,t)=>n^t,an=(n,t)=>n<<t,fn=(n,t)=>n>>t,sn=(n,t)=>n>>>t,ln=(n,t)=>n==t,hn=(n,t)=>n!=t,pn=(n,t)=>n>t,dn=(n,t)=>n>=t,gn=(n,t)=>n<t,vn=(n,t)=>n<=t,bn=(n,t)=>n===t,mn=(n,t)=>n!==t,yn=(n,t)=>n&t,jn=(n,t)=>n|t,wn=n=>-1===n,Nn=n=>-1!==n;var kn=(new Map).set("boolean",!0).set("number",!0).set("function",!0).set("symbol",!0);return n.__repr__="[MochiKit.Base]",n.AdapterRegistry=V,n.apply=t,n.bind=r,n.bindAll=e,n.bindRight=i,n.camelize=u,n.compose=o,n.counter=c,n.entries=f,n.escapeSpecial=s,n.evalJSON=G,n.extend=l,n.flattenArray=h,n.forwardCall=p,n.getType=d,n.identity=g,n.isArrayLike=v,n.isBoolean=b,n.isDateLike=m,n.isEmpty=y,n.isNotEmpty=j,n.isNull=w,n.isNumber=N,n.isObject=k,n.isString=E,n.isUndefined=A,n.isValue=S,n.itemgetter=O,n.keys=a,n.limit=B,n.mean=R,n.median=U,n.nodeWalk=q,n.noop=x,n.NotFoundError=Q,n.once=C,n.parseQueryString=T,n.partial=_,n.partialRight=F,n.primitives=kn,n.provide=I,n.setdefault=M,n.times=z,n.update=D,n.values=J,n.warnDeprecated=K,n.without=L,n.truth=P,n.lognot=X,n.not=Y,n.neg=Z,n.add=$,n.sub=nn,n.div=tn,n.mod=rn,n.mul=en,n.and=un,n.or=on,n.xor=cn,n.lshift=an,n.rshift=fn,n.zrshift=sn,n.eq=ln,n.ne=hn,n.gt=pn,n.ge=dn,n.lt=gn,n.le=vn,n.seq=bn,n.sne=mn,n.logand=yn,n.logor=jn,n.ioempty=wn,n.iofound=Nn,n}({});
(obj) {
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
