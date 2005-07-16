if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}
if (typeof(MochiKit.Base) == 'undefined') {
    MochiKit.Base = {};
}

MochiKit.Base.VERSION = "0.5";
MochiKit.Base.NAME = "MochiKit.Base"
MochiKit.Base.toString = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}

// XXX: Internet Explorer is REALLY REALLY REALLY BROKEN
// So we have to put this later..

// XXX
// XXX I HATE INTERNET EXPLORER
// XXX IT NEEDS TO DIE. NOW.
// XXX
// XXX

/*
// The birth pod for MochiKit; scopetastic
MochiKit.Base.__new__ = function () {
*/
    var update = function (self, obj/*, ... */) {
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
            for (var k in o) {
                self[k] = o[k];
            }
        }
        return self;
    };

    var setdefault = function (self, obj/*, ...*/) {
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

    var keys = function (obj) {
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
        
    var items = function (obj) {
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

    var NamedError = function (name) {
        this.message = name;
        this.name = name;
    };

    NamedError.prototype = new Error();

    var operator = {
        /***

            A table of JavaScript's operators for usage with map, filter, etc.

        ***/

        // unary operators
        "not": function (a) { return ~a; },
        "neg": function (a) { return -a; },
        "truth": function (a) { return !!a; }, 
        "lognot": function (a) { return !a; },
        "identity": function (a) { return a; },

        // binary operators
        "add": function (a, b) { return a + b; },
        "and": function (a, b) { return a & b; },
        "div": function (a, b) { return a / b; },
        "eq": function (a, b) { return a == b; },
        "mod": function (a, b) { return a % b; },
        "or": function (a, b) { return a | b; },
        "xor": function (a, b) { return a ^ b; },
        "lshift": function (a, b) { return a << b; },
        "rshift": function (a, b) { return a >> b; },
        "zrshift": function (a, b) { return a >>> b; },
        "ne": function (a, b) { return a != b; },
        "gt": function (a, b) { return a > b; },
        "ge": function (a, b) { return a >= b; },
        "lt": function (a, b) { return a < b; },
        "le": function (a, b) { return a <= b; },
        "ceq": function (a, b) { return compare(a, b) == 0; },
        "cne": function (a, b) { return compare(a, b) != 0; },
        "cgt": function (a, b) { return compare(a, b) == 1; },
        "cge": function (a, b) { return compare(a, b) != -1; },
        "clt": function (a, b) { return compare(a, b) == -1; },
        "cle": function (a, b) { return compare(a, b) != 1; },
        "logand": function (a, b) { return a && b; },
        "logor": function (a, b) { return a || b; },
        "contains": function (a, b) { return b in a; }
    };

    var forward = function (func) {
        /***

        Returns a function that forwards a method call to this.func(...)

        ***/
        return function () {
            return this[func].apply(this, arguments);
        };
    };

    var itemgetter = function (func) {
        /***

        Returns a function that returns arg[func]

        ***/
        return function (arg) {
            return arg[func];
        };
    };

    var typeMatcher = function (/* typ */) {
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

    var isCallable = typeMatcher('function');
    var isUndefined = typeMatcher('undefined');

    var isUndefinedOrNull = function (property) {
        /***

            Returns true if the given object is undefined or null

        ***/
        return ((typeof(property) == 'undefined') || property == null);
    };

    var xmap = function (fn/*, obj... */) {
        /***
        
            Return a list composed of fn(obj) for every obj given as an
            argument.

            If fn is null, operator.identity is used.

        ***/
        if (fn == null) {
            return extend(null, arguments, 1);
        }
        var rval = [];
        for (var i = 1; i < arguments.length; i++) {
            rval.push(fn(arguments[i]));
        }
        return rval;
    };

    var map = function (fn, lst/*, lst... */) {
        /***

            Return a new list composed of the results of fn(x) for every x in
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
        if (arguments.length <= 2) {
            // allow an iterable to be passed
            if (!isArrayLike(lst)) {
                // fast path for map(null, iterable)
                lst = list(lst);
                if (fn == null) {
                    return lst;
                }
            }
            // fast path for map(null, lst)
            if (fn == null) {
                return extend(null, lst);
            }
            // fast path for map(fn, lst)
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
                    arguments[i] = list(arguments[i]);
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

    var isNotEmpty = function (obj) {
        /***

            Returns true if the list or string is not empty

        ***/
        return !!(obj && obj.length);
    };

    var xfilter = function (fn/*, obj... */) {
        /***

            Returns a new list composed of the arguments where
            fn(arg) returns a true value.

            If fn is null, operator.truth will be used.

        ***/
        var rval = [];
        if (fn == null) {
            fn = operator.truth;
        }
        for (var i = 1; i < arguments.length; i++) {
            var o = arguments[i];
            if (fn(o)) {
                rval.push(o);
            }
        }
        return rval;
    };

    var filter = function (fn, lst) {
        /***

            Returns a new list composed of elements from lst where
            fn(list[i]) returns a true value.

            If fn is null, operator.truth will be used.

        ***/
        var rval = [];
        // allow an iterable to be passed
        if (!isArrayLike(lst)) {
            lst = list(lst);
        }
        if (fn == null) {
            fn = operator.truth;
        }
        for (var i = 0; i < lst.length; i++) {
            var o = lst[i];
            if (fn(o)) {
                rval.push(o);
            }
        }
        return rval;
    };

    var bind = function (func, self) {
        /***
            
            Return a copy of func bound to self.  This means whenever
            and however the return value is called, "this" will always
            reference the given "self".

            Calling bind(func, self) on an already bound function will
            return a new function that is bound to the new self.

        ***/
        var im_func = func.im_func;
        if (typeof(im_func) != 'function') {
            im_func = func;
        }
        func = function () {
            return func.im_func.apply(func.im_self, arguments);
        };
        func.im_self = self;
        func.im_func = im_func;
        return func;
    };

    var bindMethods = function (self) {
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
    var NotFound = new NamedError("NotFound");

    var AdapterRegistry = function () {
        /***

            A registry to facilitate adaptation.

            The pairs list is a list of check, wrap function pairs.
            
            All functions in this registry should be of the same arity.

        ***/
        this.pairs = [];
    };

    AdapterRegistry.prototype.register = function (name, check, wrap, /* optional */ override) {
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

    AdapterRegistry.prototype.match = function (/* ... */) {
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
        throw NotFound;
    };

    AdapterRegistry.prototype.unregister = function (name) {
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

    var comparatorRegistry = new AdapterRegistry();

    var registerComparator = function (name, check, comparator, /* optional */ override) {
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
        comparatorRegistry.register(name, check, comparator, override);
    };

    var compare = function (a, b) {
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
        var aIsNull = isUndefinedOrNull(a);
        var bIsNull = isUndefinedOrNull(b);
        if (aIsNull && bIsNull) {
            return 0;
        } else if (aIsNull) {
            return -1;
        } else if (bIsNull) {
            return 1;
        }
        try {
            return comparatorRegistry.match(a, b);
        } catch (e) {
            if (e != NotFound) {
                throw e;
            }
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            }
            // These types can't be compared
            throw new TypeError(repr(a) + " and " + repr(b) + " can not be compared");
        }
    };

// XXX
// XXX I HATE INTERNET EXPLORER
// XXX IT NEEDS TO DIE. NOW.
// XXX
// XXX


// The birth pod for MochiKit; scopetastic
MochiKit.Base.__new__ = function () {



    var isArrayLike = function () {
        /***

            Returns true if all given arguments are Array-like

        ***/
        for (var i = 0; i < arguments.length; i++) {
            var o = arguments[i];
            if (
                isUndefinedOrNull(o) ||
                typeof(o) == 'string' ||
                typeof(o.length) != 'number'
            ) {
                return false;
            }
        }
        return true;
    };

    // Register a comparator to compare array contents
    registerComparator("arrayLike", isArrayLike, function (a, b) {
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
    });

    var isDateLike = function () {
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

    // Register a comparator to compare dates
    registerComparator("dateLike", isDateLike, function (a, b) {
        return compare(a.getTime(), b.getTime());
    });
        

    var reprRegistry = new AdapterRegistry();
    var registerRepr = function (name, check, wrap, /* optional */override) {
        /***

            Register a repr function.  repr functions should take
            one argument and return a string representation of it
            suitable for developers, primarily used when debugging.

            If override is given, it is used as the highest priority
            repr, otherwise it will be used as the lowest.

        ***/
        reprRegistry.register(name, check, wrap, override);
    };

    var repr = function (o) {
        /***

            Return a "programmer representation" for an object

        ***/

        try {
            if (typeof(o.repr) == 'function') {
                return o.repr();
            }
        } catch (e) {
            // pass
        }
        try {
            return reprRegistry.match(o);
        } catch (e) {
            return o;
        }
    };

    registerRepr("arrayLike",
        isArrayLike,
        function (o) { return "[" + map(repr, o).join(", ") + "]"; }
    );

    registerRepr("string",
        typeMatcher("string"),
        function (o) { 
            o = '"' + o.replace(/(["\\])/g, '\\$1') + '"';
            return o.replace(/(\n)/g, "\\n");
        }
    ); 

    registerRepr("numbers",
        typeMatcher("number", "boolean"),
        function (o) { return o.toString(); }
    );

    registerRepr("undefined",
        typeMatcher("undefined"),
        function (o) { return "undefined"; }
    );

    registerRepr("null",
        function (o) { return o == null; },
        function (o) { return "null"; }
    );
        

    var objEqual = function (a, b) {
        /***
            
            Compare the equality of two objects.

        ***/
        return (compare(a, b) == 0);
    };

    var arrayEqual = function (self, arr) {
        /***

            Compare two arrays for equality, with a fast-path for length
            differences.

        ***/
        if (self.length != arr.length) {
            return false;
        }
        return (compare(self, arr) == 0);
    };

    var extend = function (self, obj, /* optional */skip) {
        /***

            Mutate an array by extending it with an array-like obj,
            starting with the "skip" index of obj.  If null is given
            as the initial list, a new one will be created.

            This mutates *and returns* the given list, be warned.

        ***/
        
        // Extend an array with an array-like object starting
        // from the skip index
        if (!self) {
            self = [];
        }
        if (!skip) {
            skip = 0;
        }
        if (obj) {
            // allow iterable fall-through, but skip the full isArrayLike
            // check for speed, this is called often.
            if (typeof(obj.length) != 'number' /* !isArrayLike(obj) */) {
                obj = list(obj);
            }
            for (var i = skip; i < obj.length; i++) {
                self.push(obj[i]);
            }
        }
        // This mutates, but it's convenient to return because
        // it's often used like a constructor when turning some
        // ghetto array-like to a real array
        return self;
    };

    var concat = function (/* lst... */) {
        /***

            Concatenates all given array-like arguments and returns
            a new array:

                var lst = concat(["1","3","5"], ["2","4","6"]);
                assert(lst.toString() == "1,3,5,2,4,6");

        ***/
        var rval = [];
        for (var i = 0; i < arguments.length; i++) {
            extend(rval, arguments[i]);
        }
        return rval;
    };

    var keyComparator = function (key/* ... */) {
        /***

            A comparator factory that compares a[key] with b[key].
            e.g.:

                var lst = ["a", "bbb", "cc"];
                lst.sort(keyComparator("length"));
                assert(lst.toString() == "a,cc,bbb");

        ***/
        // fast-path for single key comparisons
        if (arguments.length == 1) {
            return function (a, b) {
                return compare(a[key], b[key]);
            }
        }
        var keys = extend(null, arguments);
        return function (a, b) {
            var rval = 0;
            // keep comparing until something is inequal or we run out of
            // keys to compare
            for (var i = 0; (rval == 0) && (i < keys.length); i++) {
                var key = keys[i];
                rval = compare(a[key], b[key]);
            }
            return rval;
        };
    };

    var reverseKeyComparator = function (key) {
        /***

            A comparator factory that compares a[key] with b[key] in reverse.
            e.g.:

                var lst = ["a", "bbb", "cc"];
                lst.sort(reverseKeyComparator("length"));
                assert(lst.toString() == "bbb,cc,aa");

        ***/
        var comparator = keyComparator.apply(this, arguments);
        return function (a, b) {
            return comparator(b, a);
        }
    };

    var partial = function (func) {
        /***

            Return a partially applied function, e.g.:

                addNumbers = function (a, b) {
                    return a + b;
                }

                addOne = partial(addNumbers, 1);

                assert(addOne(2) == 3);

            NOTE: This could be used to implement, but is NOT currying.

        ***/
        var preargs = null;
        if (typeof(func.partial_func) != 'undefined') {
            preargs = func.partial_preargs;
            func = func.partial_func;
        }
        preargs = extend(preargs, arguments, 1);
        var rval = function () {
            return func.apply(this, extend(preargs.slice(), arguments));
        }
        rval.partial_preargs = preargs;
        rval.partial_func = func;
        return rval;
    };

    /***

        Create a new object consisting of the key:value pairs from the given
        arguments.  Key:value pairs from later arguments will overwrite those
        from earlier arguments.

    ***/
    var merge = partial(update, null);
     
    var listMinMax = function (which, lst) {
        /***

            If which == -1 then it will return the smallest
            element of lst.  This is also available as:

                listMin(lst)


            If which == 1 then it will return the largest
            element of lst.  This is also available as:
                
                listMax(list)

        ***/
        if (lst.length == 0) {
            return null;
        }
        var cur = lst[0];
        for (var i = 1; i < lst.length; i++) {
            var o = lst[i];
            if (compare(o, cur) == which) {
                cur = o;
            }
        }
        return cur;
    };

    var listMax = partial(listMinMax, 1);
    var listMin = partial(listMinMax, -1);

    var objMax = function (/* obj... */) {
        /***
        
            Return the maximum object out of the given objects

        ***/
        return listMinMax(1, arguments);
    };
        
    var objMin = function (/* obj... */) {
        /***

            Return the minimum object out of the given objects.

        ***/
        return listMinMax(-1, arguments);
    };

    var nodeWalk = function (node, visitor) {
        /***

            Non-recursive generic node walking function (e.g. for a DOM)

            @param node: The initial node to be searched.

            @param visitor: The visitor function, will be called as
                            visitor(node), and should return an Array-like
                            of notes to be searched next (e.g.
                            node.childNodes).

        ***/
        var nodes = [node];
        while (nodes.length) {
            extend(nodes, visitor(nodes.shift()));
        }
    };

    var zip = partial(map, null);

    var NAMES = [
        ["update", update],
        ["setdefault", setdefault],
        ["keys", keys],
        ["items", items],
        ["NamedError", NamedError],
        ["operator", operator],
        ["forward", forward],
        ["itemgetter", itemgetter],
        ["typeMatcher", typeMatcher],
        ["isCallable", isCallable],
        ["isUndefined", isUndefined],
        ["isUndefinedOrNull", isUndefinedOrNull],
        ["xmap", xmap],
        ["map", map],
        ["isNotEmpty", isNotEmpty],
        ["xfilter", xfilter],
        ["filter", filter],
        ["bind", bind],
        ["bindMethods", bindMethods],
        ["NotFound", NotFound],
        ["AdapterRegistry", AdapterRegistry],
        ["registerComparator", registerComparator],
        ["compare", compare],
        ["isArrayLike", isArrayLike],
        ["isDateLike", isDateLike],
        ["registerRepr", registerRepr],
        ["repr", repr],
        ["objEqual", objEqual],
        ["arrayEqual", arrayEqual],
        ["extend", extend],
        ["concat", concat],
        ["keyComparator", keyComparator],
        ["reverseKeyComparator", reverseKeyComparator],
        ["partial", partial],
        ["merge", merge],
        ["listMinMax", listMinMax],
        ["listMax", listMax],
        ["listMin", listMin],
        ["objMax", objMax],
        ["objMin", objMin],
        ["nodeWalk", nodeWalk],
        ["zip", zip]
    ];
    
    var EXPORT = [];
    for (var i = 0; i < NAMES.length; i++) {
        var o = NAMES[i];
        this[o[0]] = o[1];
        EXPORT.push(o[0]);
    }
    this.EXPORT = EXPORT;

    this.comparatorRegistry = comparatorRegistry;
    this.reprRegistry = reprRegistry;
    this.EXPORT_OK = ["comparatorRegistry", "reprRegistry"];

    this.EXPORT_TAGS = {
        ":common": concat(this.EXPORT_OK),
        ":all": concat(this.EXPORT, this.EXPORT_OK)
    };
    
};

MochiKit.Base.__new__();

if (typeof(JSAN) == 'undefined' 
    || (typeof(__MochiKit_Compat__) == 'boolean' && __MochiKit_Compat__)) {
        (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Base);
}
