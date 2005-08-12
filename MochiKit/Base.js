/***

MochiKit.Base 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide("MochiKit.Base");
}

if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}
if (typeof(MochiKit.Base) == 'undefined') {
    MochiKit.Base = {};
}

MochiKit.Base.VERSION = "0.80";
MochiKit.Base.NAME = "MochiKit.Base"
MochiKit.Base.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}
MochiKit.Base.toString = function () {
    return this.__repr__();
}

MochiKit.Base.clone = function (obj) {
    var me = arguments.callee;
    if (arguments.length == 1) {
        me.prototype = obj;
        return new me();
    }
};
        
MochiKit.Base.extend = function (self, obj, /* optional */skip) {
    /***

        Mutate an array by extending it with an array-like obj,
        starting with the "skip" index of obj.  If null is given
        as the initial array, a new one will be created.

        This mutates *and returns* the given array, be warned.

    ***/
    
    // Extend an array with an array-like object starting
    // from the skip index
    if (!skip) {
        skip = 0;
    }
    if (obj) {
        // allow iterable fall-through, but skip the full isArrayLike
        // check for speed, this is called often.
        var l = obj.length;
        if (typeof(l) != 'number' /* !isArrayLike(obj) */) {
            if (MochiKit.Iter) {
                obj = MochiKit.Iter.list(obj);
                l = obj.length;
            } else {
                throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
            }
        }
        if (!self) {
            self = [];
        }
        for (var i = skip; i < l; i++) {
            self.push(obj[i]);
        }
    }
    // This mutates, but it's convenient to return because
    // it's often used like a constructor when turning some
    // ghetto array-like to a real array
    return self;
};


MochiKit.Base.update = function (self, obj/*, ... */) {
    /***

        Mutate an object by replacing its key:value pairs with those
        from other object(s).  Key:value pairs from later objects will
        overwrite those from earlier objects.
        
        If null is given as the initial object, a new one will be created.

        This mutates *and returns* the given object, be warned.

        A version of this function that creates a new object is available
        as merge(o1, o2, ...)

    ***/
    if (self == null) {
        self = {};
    }
    for (var i = 1; i < arguments.length; i++) {
        var o = arguments[i];
        if (typeof(o) != 'undefined' && o != null) {
            for (var k in o) {
                self[k] = o[k];
            }
        }
    }
    return self;
};

MochiKit.Base.setdefault = function (self, obj/*, ...*/) {
    /***

        Mutate an object by replacing its key:value pairs with those
        from other object(s) IF they are not already set on the initial
        object.
        
        If null is given as the initial object, a new one will be created.

        This mutates *and returns* the given object, be warned.

    ***/
    if (self == null) {
        self = {};
    }
    for (var i = 1; i < arguments.length; i++) {
        var o = arguments[i];
        for (var k in o) {
            if (!(k in self)) {
                self[k] = o[k];
            }
        }
    }
    return self;
};

MochiKit.Base.keys = function (obj) {
    /***

        Return an array of the property names of an object
        (in no particular order).

    ***/
    var rval = [];
    for (var prop in obj) {
        rval.push(prop);
    }
    return rval;
};
    
MochiKit.Base.items = function (obj) {
    /***

        Return an array of [propertyName, propertyValue] pairs for an
        object (in no particular order).

    ***/
    var rval = [];
    for (var prop in obj) {
        rval.push([prop, obj[prop]]);
    }
    return rval;
};

MochiKit.Base.NamedError = function (name) {
    this.message = name;
    this.name = name;
};
MochiKit.Base.NamedError.prototype = new Error();
MochiKit.Base.NamedError.prototype.repr = function () {
    if (this.message && this.message != this.name) {
        return this.name + "(" + repr(this.message) + ")";
    } else {
        return this.name + "()";
    }
}
MochiKit.Base.NamedError.prototype.toString = function () {
    return this.repr();
}

MochiKit.Base.operator = {
    /***

        A table of JavaScript's operators for usage with map, filter, etc.

    ***/

    // unary logic operators
    "truth": function (a) { return !!a; }, 
    "lognot": function (a) { return !a; },
    "identity": function (a) { return a; },

    // bitwise unary operators
    "not": function (a) { return ~a; },
    "neg": function (a) { return -a; },

    // binary operators
    "add": function (a, b) { return a + b; },
    "div": function (a, b) { return a / b; },
    "mod": function (a, b) { return a % b; },

    // bitwise binary operators
    "and": function (a, b) { return a & b; },
    "or": function (a, b) { return a | b; },
    "xor": function (a, b) { return a ^ b; },
    "lshift": function (a, b) { return a << b; },
    "rshift": function (a, b) { return a >> b; },
    "zrshift": function (a, b) { return a >>> b; },

    // near-worthless build-in comparators
    "eq": function (a, b) { return a == b; },
    "ne": function (a, b) { return a != b; },
    "gt": function (a, b) { return a > b; },
    "ge": function (a, b) { return a >= b; },
    "lt": function (a, b) { return a < b; },
    "le": function (a, b) { return a <= b; },

    // compare comparators
    "ceq": function (a, b) { return MochiKit.Base.compare(a, b) == 0; },
    "cne": function (a, b) { return MochiKit.Base.compare(a, b) != 0; },
    "cgt": function (a, b) { return MochiKit.Base.compare(a, b) == 1; },
    "cge": function (a, b) { return MochiKit.Base.compare(a, b) != -1; },
    "clt": function (a, b) { return MochiKit.Base.compare(a, b) == -1; },
    "cle": function (a, b) { return MochiKit.Base.compare(a, b) != 1; },

    // binary logical operators
    "logand": function (a, b) { return a && b; },
    "logor": function (a, b) { return a || b; },
    "contains": function (a, b) { return b in a; }
};

MochiKit.Base.forward = function (func) {
    /***

    Returns a function that forwards a method call to this.func(...)

    ***/
    return function () {
        return this[func].apply(this, arguments);
    };
};

MochiKit.Base.itemgetter = function (func) {
    /***

    Returns a function that returns arg[func]

    ***/
    return function (arg) {
        return arg[func];
    };
};

MochiKit.Base.typeMatcher = function (/* typ */) {
    /***

    Given a set of types (as string arguments),
    returns a function that will return true if the types of the given
    objects are members of that set.

    ***/
    
    var types = {};
    for (var i = 0; i < arguments.length; i++) {
        var typ = arguments[i];
        types[typ] = typ;
    }
    return function () { 
        for (var i = 0; i < arguments.length; i++) {
            if (!(typeof(arguments[i]) in types)) {
                return false;
            }
        }
        return true;
    };
};

MochiKit.Base.isNull = function (/* ... */) {
    /***

    Returns true if all arguments are null.

    ***/
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) {
            return false;
        }
    }
    return true;
}

MochiKit.Base.isUndefinedOrNull = function (/* ... */) {
    /***

        Returns true if all arguments are undefined or null

    ***/
    for (var i = 0; i < arguments.length; i++) {
        var o = arguments[i];
        if (!(typeof(o) == 'undefined' || o == null)) {
            return false;
        }
    }
    return true;
};

MochiKit.Base.isNotEmpty = function (obj) {
    /***

        Returns true if all the array or string arguments
        are not empty

    ***/
    for (var i = 0; i < arguments.length; i++) {
        var o = arguments[i];
        if (!(o && o.length)) {
            return false;
        }
    }
    return true;
};

MochiKit.Base.isArrayLike = function () {
    /***

        Returns true if all given arguments are Array-like

    ***/
    for (var i = 0; i < arguments.length; i++) {
        var o = arguments[i];
        var typ = typeof(o);
        if (
            (typ != 'object' && !(typ == 'function' && typeof(o.item) == 'function')) ||
            o == null ||
            typeof(o.length) != 'number'
        ) {
            return false;
        }
    }
    return true;
};

MochiKit.Base.isDateLike = function () {
    /***

        Returns true if all given arguments are Date-like

    ***/
    for (var i = 0; i < arguments.length; i++) {
        var o = arguments[i];
        if (typeof(o) != "object" || typeof(o.getTime) != 'function') {
            return false;
        }
    }
    return true;
};


MochiKit.Base.xmap = function (fn/*, obj... */) {
    /***
    
        Return an array composed of fn(obj) for every obj given as an
        argument.

        If fn is null, operator.identity is used.

    ***/
    if (fn == null) {
        return MochiKit.Base.extend(null, arguments, 1);
    }
    var rval = [];
    for (var i = 1; i < arguments.length; i++) {
        rval.push(fn(arguments[i]));
    }
    return rval;
};

MochiKit.Base.map = function (fn, lst/*, lst... */) {
    /***

        Return a new array composed of the results of fn(x) for every x in
        lst

        If fn is null, and only one sequence argument is given the identity
        function is used.
        
            map(null, lst) -> lst.slice();

        If fn is null, and more than one sequence is given as arguments,
        then the Array function is used, making it equivalent to zip.

            map(null, p, q, ...)
                -> zip(p, q, ...)
                -> [[p0, q0, ...], [p1, q1, ...], ...];

    ***/
    var isArrayLike = MochiKit.Base.isArrayLike;
    if (arguments.length <= 2) {
        // allow an iterable to be passed
        if (!isArrayLike(lst)) {
            if (MochiKit.Iter) {
                // fast path for map(null, iterable)
                lst = MochiKit.Iter.list(lst);
                if (fn == null) {
                    return lst;
                }
            } else {
                throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
            }
        }
        // fast path for map(null, lst)
        if (fn == null) {
            return MochiKit.Base.extend(null, lst);
        }
        // disabled fast path for map(fn, lst)
        if (false && typeof(Array.prototype.map) == 'function') {
            // Mozilla fast-path
            return Array.prototype.map.call(lst, fn);
        }
        var rval = [];
        for (var i = 0; i < lst.length; i++) {
            rval.push(fn(lst[i]));
        }
        return rval;
    } else {
        // default for map(null, ...) is zip(...)
        if (fn == null) {
            fn = Array;
        }
        var length = null;
        for (var i = 1; i < arguments.length; i++) {
            // allow iterables to be passed
            if (!isArrayLike(arguments[i])) {
                if (MochiKit.Iter) {
                    arguments[i] = MochiKit.Iter.list(arguments[i]);
                } else {
                    throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
                }
            }
            // find the minimum length
            var l = arguments[i].length;
            if (length == null || length > l) {
                length = l;
            }
        }
        var rval = [];
        for (var i = 0; i < length; i++) {
            var args = [];
            for (var j = 1; j < arguments.length; j++) {
                args.push(arguments[j][i]);
            }
            rval.push(fn.apply(this, args));
        }
        return rval;
    }
};

MochiKit.Base.xfilter = function (fn/*, obj... */) {
    var rval = [];
    if (fn == null) {
        fn = MochiKit.Base.operator.truth;
    }
    for (var i = 1; i < arguments.length; i++) {
        var o = arguments[i];
        if (fn(o)) {
            rval.push(o);
        }
    }
    return rval;
};

MochiKit.Base.filter = function (fn, lst, self) {
    var rval = [];
    // allow an iterable to be passed
    if (!MochiKit.Base.isArrayLike(lst)) {
        if (MochiKit.Iter) {
            lst = MochiKit.Iter.list(lst);
        } else {
            throw new TypeError("Argument not an array-like and MochiKit.Iter not present");
        }
    }
    if (fn == null) {
        fn = MochiKit.Base.operator.truth;
    }
    if (typeof(Array.prototype.filter) == 'function') {
        // Mozilla fast-path
        return Array.prototype.filter.call(lst, fn, self);
    }
    else if (typeof(self) == 'undefined' || self == null) {
        for (var i = 0; i < lst.length; i++) {
            var o = lst[i];
            if (fn(o)) {
                rval.push(o);
            }
        }
    } else {
        for (var i = 0; i < lst.length; i++) {
            var o = lst[i];
            if (fn.call(self, o)) {
                rval.push(o);
            }
        }
    }
    return rval;
};


MochiKit.Base.bind = function (func, self/* args... */) {
    var im_func = func.im_func;
    var im_preargs = func.im_preargs;
    var im_self = func.im_self;
    if (typeof(im_func) != 'function') {
        im_func = func;
    }
    if (typeof(self) != 'undefined') {
        im_self = self;
    }
    if (typeof(im_preargs) == 'undefined') {
        im_preargs = [];
    } else  {
        im_preargs = im_preargs.slice();
    }
    MochiKit.Base.extend(im_preargs, arguments, 2);
    var newfunc = function () {
        var args = arguments;
        var me = arguments.callee;
        if (me.im_preargs.length > 0) {
            args = MochiKit.Base.concat(me.im_preargs, args);
        }
        var self = me.im_self;
        if (!self) {
            self = this;
        }
        return me.im_func.apply(self, args);
    };
    newfunc.im_self = im_self;
    newfunc.im_func = im_func;
    newfunc.im_preargs = im_preargs;
    return newfunc;
};

MochiKit.Base.bindMethods = function (self) {
    /***

        Bind all functions in self to self,
        which gives you a semi-Pythonic sort of instance.

    ***/
    for (var k in self) {
        var func = self[k];
        if (typeof(func) == 'function') {
            self[k] = bind(func, self);
        }
    }
};

// A singleton raised when no suitable adapter is found
MochiKit.Base.NotFound = new MochiKit.Base.NamedError("MochiKit.Base.NotFound");

MochiKit.Base.AdapterRegistry = function () {
    /***

        A registry to facilitate adaptation.

        Pairs is an array of [name, check, wrap] triples
        
        All check/wrap functions in this registry should be of the same arity.

    ***/
    this.pairs = [];
};

MochiKit.Base.AdapterRegistry.prototype.register = function (name, check, wrap, /* optional */ override) {
    /***
        
        The check function should return true if the given arguments are
        appropriate for the wrap function.

        If override is given and true, the check function will be given
        highest priority.  Otherwise, it will be the lowest priority
        adapter.

    ***/

    if (override) {
        this.pairs.unshift([name, check, wrap]);
    } else {
        this.pairs.push([name, check, wrap]);
    }
};

MochiKit.Base.AdapterRegistry.prototype.match = function (/* ... */) {
    /***

        Find an adapter for the given arguments.
        
        If no suitable adapter is found, throws NotFound.

    ***/
    for (var i = 0; i < this.pairs.length; i++) {
        var pair = this.pairs[i];
        if (pair[1].apply(this, arguments)) {
            return pair[2].apply(this, arguments);
        }
    }
    throw MochiKit.Base.NotFound;
};

MochiKit.Base.AdapterRegistry.prototype.unregister = function (name) {
    /***

        Remove a named adapter from the registry

    ***/
    for (var i = 0; i < this.pairs.length; i++) {
        var pair = this.pairs[i];
        if (pair[0] == name) {
            this.pairs.splice(i, 1);
            return true;
        }
    }
    return false;
};

MochiKit.Base.registerComparator = function (name, check, comparator, /* optional */ override) {
    /***

        Register a comparator for use with the compare function.

        name should be a unique identifier describing the comparator.

        check is a function (a, b) that returns true if a and b
        can be compared with comparator.

        comparator is a function (a, b) that returns:

             0 when a == b
             1 when a > b
            -1 when a < b

        comparator is guaranteed to only be called if check(a, b)
        returns a true value.

        If override is given and true, then it will be made the
        highest precedence comparator.  Otherwise, the lowest.

    ***/
    MochiKit.Base.comparatorRegistry.register(name, check, comparator, override);
};

MochiKit.Base.compare = function (a, b) {
    /***

        Compare two objects in a sensible manner.  Currently this is:
        
            1. undefined and null compare equal to each other
            2. undefined and null are less than anything else
            3. comparators registered with registerComparator are
               used to find a good comparator.  Built-in comparators
               are currently available for arrays and dates.
            4. Otherwise hope that the built-in comparison operators
               do something useful, which should work for numbers
               and strings.

        Returns what one would expect from a comparison function.

        returns:

             0 when a == b
             1 when a > b 
            -1 when a < b

    ***/
    if (a == b) {
        return 0;
    }
    var aIsNull = (typeof(a) == 'undefined' || a == null);
    var bIsNull = (typeof(b) == 'undefined' || b == null);
    if (aIsNull && bIsNull) {
        return 0;
    } else if (aIsNull) {
        return -1;
    } else if (bIsNull) {
        return 1;
    }
    try {
        return MochiKit.Base.comparatorRegistry.match(a, b);
    } catch (e) {
        if (e != MochiKit.Base.NotFound) {
            throw e;
        }
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }
        // These types can't be compared
        var repr = MochiKit.Base.repr;
        throw new TypeError(repr(a) + " and " + repr(b) + " can not be compared");
    }
};

MochiKit.Base.compareDateLike = function (a, b) {
    a = a.getTime();
    b = b.getTime();
    if (a == b) {
        return 0;
    } else if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    }
    var repr = MochiKit.Base.repr;
    throw new TypeError(repr(a) + " and " + repr(b) + " can not be compared");
};

MochiKit.Base.compareArrayLike = function (a, b) {
    var compare = MochiKit.Base.compare;
    var count = a.length;
    var rval = 0;
    if (count > b.length) {
        rval = 1;
    } else if (count < b.length) {
        rval = -1;
        count = b.length;
    }
    for (var i = 0; i < count; i++) {
        var cmp = compare(a[i], b[i]);
        if (cmp) {
            return cmp;
        }
    }
    return rval;
};

MochiKit.Base.registerRepr = function (name, check, wrap, /* optional */override) {
    /***

        Register a repr function.  repr functions should take
        one argument and return a string representation of it
        suitable for developers, primarily used when debugging.

        If override is given, it is used as the highest priority
        repr, otherwise it will be used as the lowest.

    ***/
    MochiKit.Base.reprRegistry.register(name, check, wrap, override);
};

MochiKit.Base.repr = function (o) {
    /***

        Return a "programmer representation" for an object

    ***/

    try {
        if (typeof(o.__repr__) == 'function') {
            return o.__repr__();
        } else if (typeof(o.repr) == 'function' && o.repr != arguments.callee) {
            return o.repr();
        }
        return MochiKit.Base.reprRegistry.match(o);
    } catch (e) {
        if (typeof(o.NAME) == 'string' && (
                o.toString == Function.prototype.toString ||
                o.toString == Object.prototype.toString
            )) {
            return o.NAME;
        }
        return o;
    }
};

MochiKit.Base.reprArrayLike = function (o) {
    return "[" + MochiKit.Base.map(MochiKit.Base.repr, o).join(", ") + "]";
};

MochiKit.Base.reprString = function (o) { 
    /* XXX: this is not perfect */
    o = '"' + o.replace(/(["\\])/g, '\\$1') + '"';
    o = o.replace(/(\n)/g, "\\n");
    o = o.replace(/(\t)/g, "\\t");
    o = o.replace(/(\r)/g, "\\r");
    return o;
};

MochiKit.Base.reprNumber = function (o) {
    return o.toString();
};

MochiKit.Base.reprUndefined = function (o) {
    return "undefined";
};

MochiKit.Base.reprNull = function (o) {
    return "null";
};

MochiKit.Base.objEqual = function (a, b) {
    /***
        
        Compare the equality of two objects.

    ***/
    return (MochiKit.Base.compare(a, b) == 0);
};

MochiKit.Base.arrayEqual = function (self, arr) {
    /***

        Compare two arrays for equality, with a fast-path for length
        differences.

    ***/
    if (self.length != arr.length) {
        return false;
    }
    return (MochiKit.Base.compare(self, arr) == 0);
};

MochiKit.Base.concat = function (/* lst... */) {
    /***

        Concatenates all given array-like arguments and returns
        a new array:

            var lst = concat(["1","3","5"], ["2","4","6"]);
            assert(lst.toString() == "1,3,5,2,4,6");

    ***/
    var rval = [];
    var extend = MochiKit.Base.extend;
    for (var i = 0; i < arguments.length; i++) {
        extend(rval, arguments[i]);
    }
    return rval;
};

MochiKit.Base.keyComparator = function (key/* ... */) {
    /***

        A comparator factory that compares a[key] with b[key].
        e.g.:

            var lst = ["a", "bbb", "cc"];
            lst.sort(keyComparator("length"));
            assert(lst.toString() == "a,cc,bbb");

    ***/
    // fast-path for single key comparisons
    var compare = MochiKit.Base.compare;
    if (arguments.length == 1) {
        return function (a, b) {
            return compare(a[key], b[key]);
        }
    }
    var compareKeys = MochiKit.Base.extend(null, arguments);
    return function (a, b) {
        var rval = 0;
        // keep comparing until something is inequal or we run out of
        // keys to compare
        for (var i = 0; (rval == 0) && (i < compareKeys.length); i++) {
            var key = compareKeys[i];
            rval = compare(a[key], b[key]);
        }
        return rval;
    };
};

MochiKit.Base.reverseKeyComparator = function (key) {
    /***

        A comparator factory that compares a[key] with b[key] in reverse.
        e.g.:

            var lst = ["a", "bbb", "cc"];
            lst.sort(reverseKeyComparator("length"));
            assert(lst.toString() == "bbb,cc,aa");

    ***/
    var comparator = MochiKit.Base.keyComparator.apply(this, arguments);
    return function (a, b) {
        return comparator(b, a);
    }
};

MochiKit.Base.partial = function (func) {
    return MochiKit.Base.bind.apply(this, MochiKit.Base.extend([func, undefined], arguments, 1));
};
 
MochiKit.Base.listMinMax = function (which, lst) {
    /***

        If which == -1 then it will return the smallest
        element of the array-like lst.  This is also available
        as:

            listMin(lst)


        If which == 1 then it will return the largest
        element of the array-like lst.  This is also available
        as:
            
            listMax(list)

    ***/
    if (lst.length == 0) {
        return null;
    }
    var cur = lst[0];
    var compare = MochiKit.Base.compare;
    for (var i = 1; i < lst.length; i++) {
        var o = lst[i];
        if (compare(o, cur) == which) {
            cur = o;
        }
    }
    return cur;
};

MochiKit.Base.objMax = function (/* obj... */) {
    /***
    
        Return the maximum object out of the given arguments

    ***/
    return MochiKit.Base.listMinMax(1, arguments);
};
        
MochiKit.Base.objMin = function (/* obj... */) {
    /***

        Return the minimum object out of the given arguments

    ***/
    return MochiKit.Base.listMinMax(-1, arguments);
};

MochiKit.Base.nodeWalk = function (node, visitor) {
    /***

        Non-recursive generic node walking function (e.g. for a DOM)

        @param node: The initial node to be searched.

        @param visitor: The visitor function, will be called as
                        visitor(node), and should return an Array-like
                        of notes to be searched next (e.g.
                        node.childNodes).

    ***/
    var nodes = [node];
    var extend = MochiKit.Base.extend;
    while (nodes.length) {
        var res = visitor(nodes.shift());
        if (res) {
            extend(nodes, res);
        }
    }
};

   
MochiKit.Base.nameFunctions = function (namespace) {
    var base = namespace.NAME;
    if (typeof(base) == 'undefined') {
        base = '';
    } else {
        base = base + '.';
    }
    for (var name in namespace) {
        var o = namespace[name];
        if (typeof(o) == 'function' && typeof(o.NAME) == 'undefined') {
            try {
                o.NAME = base + name;
            } catch (e) {
                // pass
            }
        }
    }
};


MochiKit.Base.urlEncode = function (unencoded) {
    var rval = escape(unencoded).replace(/\+/g, '%2B').replace(/\"/g,'%22');
    return rval.replace(/\'/g, '%27');
};


MochiKit.Base.queryString = function (names, values) {
    if (arguments.length == 1) {
        var o = names;
        names = [];
        values = [];
        for (var k in o) {
            var v = o[k];
            if (typeof(v) != "function") {
                names.push(k);
                values.push(v);
            }
        }
    }
    var rval = [];
    var len = Math.min(names.length, values.length);
    var urlEncode = MochiKit.Base.urlEncode;
    for (var i = 0; i < len; i++) {
        var v = values[i];
        if (typeof(v) != 'undefined' && v != null) {
            rval.push(urlEncode(names[i]) + "=" + urlEncode(v));
        }
    }
    return rval.join("&");
};


MochiKit.Base.parseQueryString = function (encodedString, useArrays) {
    var pairs = encodedString.replace(/\+/g, "%20").split("&");
    var o = {};
    if (useArrays) {
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            var name = unescape(pair[0]);
            var arr = o[name];
            if (!(arr instanceof Array)) {
                arr = [];
                o[name] = arr;
            }
            arr.push(unescape(pair[1]));
        }
    } else {
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            o[unescape(pair[0])] = unescape(pair[1]);
        }
    }
    return o;
};
    

MochiKit.Base.EXPORT = [
    "clone",
    "extend",
    "update",
    "setdefault",
    "keys",
    "items",
    "NamedError",
    "operator",
    "forward",
    "itemgetter",
    "typeMatcher",
    "isCallable",
    "isUndefined",
    "isUndefinedOrNull",
    "isNull",
    "isNotEmpty",
    "isArrayLike",
    "isDateLike",
    "xmap",
    "map",
    "xfilter",
    "filter",
    "bind",
    "bindMethods",
    "NotFound",
    "AdapterRegistry",
    "registerComparator",
    "compare",
    "registerRepr",
    "repr",
    "objEqual",
    "arrayEqual",
    "concat",
    "keyComparator",
    "reverseKeyComparator",
    "partial",
    "merge",
    "listMinMax",
    "listMax",
    "listMin",
    "objMax",
    "objMin",
    "nodeWalk",
    "zip",
    "urlEncode",
    "queryString",
    "parseQueryString"
];

MochiKit.Base.EXPORT_OK = [
    "nameFunctions",
    "comparatorRegistry",
    "reprRegistry",
    "compareDateLike",
    "compareArrayLike",
    "reprArrayLike",
    "reprString",
    "reprNumber",
    "reprUndefined",
    "reprNull"
];


MochiKit.Base.__new__ = function () {

    this.listMax = this.partial(this.listMinMax, 1);
    this.listMin = this.partial(this.listMinMax, -1);

    this.isCallable = this.typeMatcher('function');
    this.isUndefined = this.typeMatcher('undefined');

    this.merge = this.partial(this.update, null);
    this.zip = this.partial(this.map, null);

    this.comparatorRegistry = new this.AdapterRegistry();
    this.registerComparator("dateLike", this.isDateLike, this.compareDateLike);
    this.registerComparator("arrayLike", this.isArrayLike, this.compareArrayLike);

    this.reprRegistry = new this.AdapterRegistry();
    this.registerRepr("arrayLike", this.isArrayLike, this.reprArrayLike);
    this.registerRepr("string", this.typeMatcher("string"), this.reprString);
    this.registerRepr("numbers", this.typeMatcher("number", "boolean"), this.reprNumber);
    this.registerRepr("undefined", this.isUndefined, this.reprUndefined);
    this.registerRepr("null", this.isNull, this.reprNull);

    var all = this.concat(this.EXPORT, this.EXPORT_OK);
    this.EXPORT_TAGS = {
        ":common": this.concat(this.EXPORT_OK),
        ":all": all
    };

    this.nameFunctions(this);

};

MochiKit.Base.__new__();

//
// XXX: Internet Explorer blows
//
compare = MochiKit.Base.compare;


if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
        (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Base);
}
