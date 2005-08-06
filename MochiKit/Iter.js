/***

MochiKit.Iter 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Iter');
    dojo.require('MochiKit.Base');
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base", []);
}   

try {
    if (typeof(MochiKit.Base) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.Iter depends on MochiKit.Base!";
}  
            
if (typeof(MochiKit.Iter) == 'undefined') {
    MochiKit.Iter = {};
}           
        
MochiKit.Iter.NAME = "MochiKit.Iter";
MochiKit.Iter.VERSION = "0.80";
MochiKit.Iter.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}
MochiKit.Iter.toString = function () {
    return this.__repr__();
}

MochiKit.Iter.registerIteratorFactory = function (name, check, iterfactory, /* optional */ override) {
    /***

        Register an iterator factory for use with the iter function.

        check is a function (a) that returns true if a can be converted
        into an iterator with iterfactory.

        iterfactory is a function (a) that returns an object with a
        "next" function that returns the next value in the sequence.

        iterfactory is guaranteed to only be called if check(a)
        returns a true value.

        If override is given and true, then it will be made the
        highest precedence iterator factory.  Otherwise, the lowest.

    ***/

    MochiKit.Iter.iteratorRegistry.register(name, check, iterfactory, override);
};

MochiKit.Iter.iter = function (iterable, /* optional */ sentinel) {
    /***

        Convert the given argument to an iterator (object implementing
        "next").
        
        1. If iterable is an iterator (implements "next"), then it will be
           returned as-is.
        2. If iterable is an iterator factory (implements "iter"), then the
           result of iterable.iter() will be returned.
        3. Otherwise, the iterator factory registry is used to find a 
           match.
        4. If no factory is found, it will throw TypeError

        When used directly, using an iterator should look like this::

            var it = iter(iterable);
            try {
                while (var o = it.next()) {
                    // use o
                }
            } catch (e) {
                if (e != StopIteration) {
                    throw e;
                }
                // pass
            }

    ***/
    
    if (arguments.length == 2) {
        return MochiKit.Iter.takewhile(
            function (a) { return a != sentinel; },
            iterable);
    }
    if (typeof(iterable.next) == 'function') {
        return iterable;
    } else if (typeof(iterable.iter) == 'function') {
        return iterable.iter();
    }
    try {
        return MochiKit.Iter.iteratorRegistry.match(iterable);
    } catch (e) {
        if (e == MochiKit.Base.NotFound) {
            e = new TypeError(typeof(iterable) + ": " + MochiKit.Base.repr(iterable) + " is not iterable");
        }
        throw e;
    }
};

MochiKit.Iter.count = function (n) {
    /***

        count([n]) --> n, n + 1, n + 2, ...

    ***/
    if (!n) {
        n = 0;
    }
    return {
        "repr": function () { return "count(" + n + ")"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () { return n++; }
    };
};

MochiKit.Iter.cycle = function (p) {
    /***

        cycle(p) --> p0, p1, ... plast, p0, p1, ...

    ***/
    var lst = [];
    var iterator = MochiKit.Iter.iter(p);
    return {
        "repr": function () { return "cycle(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            try {
                var rval = iterator.next();
                lst.push(rval);
                return rval;
            } catch (e) {
                if (e != MochiKit.Iter.StopIteration) {
                    throw e;
                }
                if (lst.length == 0) {
                    this.next = function () {
                        throw MochiKit.Iter.StopIteration;
                    };
                } else {
                    var i = -1;
                    this.next = function () {
                        i = (i + 1) % lst.length;
                        return lst[i];
                    }
                }
                return this.next();
            }
        }
    }
};

MochiKit.Iter.repeat = function (elem, /* optional */n) {
    /***
    
        repeat(elem, [,n]) --> elem, elem, elem, ... endlessly or up to n
            times

    ***/
    if (typeof(n) == 'undefined') {
        return {
            "repr": function () {
                return "repeat(" + MochiKit.Base.repr(elem) + ")";
            },
            "toString": MochiKit.Base.forward("repr"),
            "next": function () {
                return elem;
            }
        };
    }
    return {
        "repr": function () {
            return "repeat(" + MochiKit.Base.repr(elem) + ", " + n + ")";
        },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            if (n <= 0) {
                throw MochiKit.Iter.StopIteration;
            }
            n -= 1;
            return elem;
        }
    };
};
        
MochiKit.Iter.next = function (iterator) {
    /***

        Return the next value from the iterator

    ***/
    return iterator.next();
};

MochiKit.Iter.izip = function (p, q/*, ...*/) {
    /***

        izip(p, q, ...) --> (p0, q0, ...), (p1, q1, ...), ...

    ***/
    var map = MochiKit.Base.map;
    var next = MochiKit.Iter.next;
    var iterables = map(iter, arguments);
    return {
        "repr" : function () { return "izip(...)"; },
        "toString" : MochiKit.Base.forward("repr"),
        "next": function () { return map(next, iterables); }
    };
};

MochiKit.Iter.ifilter = function (pred, seq) {
    /***

        ifilter(pred, seq) --> elements of seq where pred(elem) is true

    ***/
    seq = MochiKit.Iter.iter(seq);
    if (pred == null) {
        pred = MochiKit.Base.operator.truth;
    }
    return {
        "repr": function () { return "ifilter(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            while (true) {
                var rval = seq.next();
                if (pred(rval)) {
                    return rval;
                }
            }
        }
    }
};

MochiKit.Iter.ifilterfalse = function (pred, seq) {
    /***

        ifilterfalse(pred, seq) --> elements of seq where pred(elem) is
            false

    ***/
    seq = MochiKit.Iter.iter(seq);
    if (pred == null) {
        pred = MochiKit.Base.operator.truth;
    }
    return {
        "repr": function () { return "ifilterfalse(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            while (true) {
                var rval = seq.next();
                if (!pred(rval)) {
                    return rval;
                }
            }
        }
    }
};
 
MochiKit.Iter.islice = function (seq/*, [start,] stop[, step] */) {
    /***

        islice(seq, [start,] stop[, step])  --> elements from 
            seq[start:stop:step] (in Python slice syntax)

    ***/
    seq = MochiKit.Iter.iter(seq);
    var start = 0;
    var stop = 0;
    var step = 1;
    var i = -1;
    if (arguments.length == 2) {
        stop = arguments[1];
    } else if (arguments.length == 3) {
        start = arguments[1];
        stop = arguments[2];
    } else {
        start = arguments[1];
        stop = arguments[2];
        step = arguments[3];
    }
    return {
        "repr": function () {
            return "islice(" + ["...", start, stop, step].join(", ") + ")";
        },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            var rval;
            while (i < start) {
                rval = seq.next();
                i++;
            }
            if (start >= stop) {
                throw MochiKit.Iter.StopIteration;
            }
            start += step;
            return rval;
        }
    };
};

MochiKit.Iter.imap = function (fun, p, q/*, ...*/) {
    /***

        imap(fun, p, q, ...) --> fun(p0, q0, ...), fun(p1, q1, ...), ...

    ***/
    var map = MochiKit.Base.map;
    var iterables = map(MochiKit.Iter.iter, MochiKit.Base.extend(null, arguments, 1));
    var next = MochiKit.Iter.next;
    return {
        "repr": function () { return "imap(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            return fun.apply(this, map(next, iterables));
        }
    };
};
    
MochiKit.Iter.applymap = function (fun, seq, self) {
    /***

        applymap(fun, seq) -->
            fun.apply(self, seq0), fun.apply(self, seq1), ...

    ***/
    seq = MochiKit.Iter.iter(seq);
    return {
        "repr": function () { return "applymap(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            return fun.apply(self, seq.next());
        }
    };
};

MochiKit.Iter.chain = function (p, q/*, ...*/) {
    /***

        chain(p, q, ...) --> p0, p1, ... plast, q0, q1, ...

    ***/
    // dumb fast path
    var iter = MochiKit.Iter.iter;
    if (arguments.length == 1) {
        return iter(arguments[0]);
    }
    var argiter = MochiKit.Base.map(iter, arguments);
    var bind = MochiKit.Base.bind;
    return {
        "repr": function () { return "chain(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            while (argiter.length > 1) {
                try {
                    return argiter[0].next();
                } catch (e) {
                    if (e != MochiKit.Iter.StopIteration) {
                        throw e;
                    }
                    argiter.shift();
                }
            }
            if (argiter.length == 1) {
                // optimize last element
                var arg = argiter.shift();
                this.next = bind(arg.next, arg);
                return this.next();
            }
            throw MochiKit.Iter.StopIteration;
        }
    };
};

MochiKit.Iter.takewhile = function (pred, seq) {
    /***

        takewhile(pred, seq) --> seq[0], seq[1], ... until pred(seq[n])
            fails

    ***/
    seq = MochiKit.Iter.iter(seq);
    return {
        "repr": function () { return "takewhile(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            var rval = seq.next();
            if (!pred(rval)) {
                this.next = function () {
                    throw MochiKit.Iter.StopIteration;
                };
                throw MochiKit.Iter.StopIteration;
            }
            return rval;
        }
    };
};

MochiKit.Iter.dropwhile = function (pred, seq) {
    /***

        dropwhile(pred, seq) --> seq[n], seq[n + 1], starting when
            pred(seq[n]) fails

    ***/
    seq = MochiKit.Iter.iter(seq);
    var bind = MochiKit.Base.bind;
    return {
        "repr": function () { return "dropwhile(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            while (true) {
                var rval = seq.next();
                if (!pred(rval)) {
                    break;
                }
            }
            this.next = bind(seq.next, seq);
            return rval;
        }
    };
};

MochiKit.Iter._tee = function (ident, sync, iterable) {
    sync.pos[ident] = -1;
    var listMin = MochiKit.Base.listMin;
    return {
        "repr": function () { return "tee(" + ident + ", ...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            var rval;
            var i = sync.pos[ident];

            if (i == sync.max) {
                rval = iterable.next();
                sync.deque.push(rval);
                sync.max += 1;
                sync.pos[ident] += 1;
            } else {
                rval = sync.deque[i - sync.min];
                sync.pos[ident] += 1;
                if (i == sync.min && listMin(sync.pos) != sync.min) {
                    sync.min += 1;
                    sync.deque.shift();
                }
            }
            return rval;
        }
    };
};

MochiKit.Iter.tee = function (iterable, n/* = 2 */) {
    /***

        tee(it, n=2) --> (it1, it2, it3, ... itn) splits one iterator
            into n

    ***/
    var rval = [];
    var sync = {
        "pos": [],
        "deque": [],
        "max": -1,
        "min": -1
    };
    if (arguments.length == 1) {
        n = 2;
    }
    iterable = MochiKit.Iter.iter(iterable);
    var _tee = MochiKit.Iter._tee;
    for (var i = 0; i < n; i++) {
        rval.push(_tee(i, sync, iterable));
    }
    return rval;
};

MochiKit.Iter.list = function (iterable) {
    /***

        Convert an iterable to a new array

    ***/

    // Fast-path for Array and Array-like
    if (typeof(iterable.slice) == 'function') {
        return iterable.slice();
    } else if (MochiKit.Base.isArrayLike(iterable)) {
        return MochiKit.Base.concat(iterable);
    }

    iterable = MochiKit.Iter.iter(iterable);
    var rval = [];
    try {
        while (true) {
            rval.push(iterable.next());
        }
    } catch (e) {
        if (e != MochiKit.Iter.StopIteration) {
            throw e;
        }
        return rval;
    }
};

    
MochiKit.Iter.reduce = function (fn, iterable, /* optional */initial) {
    /***
    
        Apply a fn = function (a, b) cumulatively to the items of an
        iterable from left to right, so as to reduce the iterable
        to a single value.

        For example::
        
            reduce(function (a, b) { return x + y; }, [1, 2, 3, 4, 5])

        calculates::

            ((((1 + 2) + 3) + 4) + 5).
        
        If initial is given, it is placed before the items of the sequence
        in the calculation, and serves as a default when the sequence is
        empty.

        Note that the above example could be written more clearly as::

            reduce(operator.add, [1, 2, 3, 4, 5])

        Or even simpler::

            sum([1, 2, 3, 4, 5])

    ***/
    var i = 0;
    var x = initial;
    iterable = MochiKit.Iter.iter(iterable);
    if (arguments.length < 3) {
        try {
            x = iterable.next();
        } catch (e) {
            if (e == MochiKit.Iter.StopIteration) {
                e = new TypeError("reduce() of empty sequence with no initial value");
            }
            throw e;
        }
        i++;
    }
    try {
        while (true) {
            x = fn(x, iterable.next());
        }
    } catch (e) {
        if (e != MochiKit.Iter.StopIteration) {
            throw e;
        }
        return x;
    }
};

MochiKit.Iter.range = function (/* [start,] stop[, step] */) {
    /***

    Return an iterator containing an arithmetic progression of integers.
    range(i, j) returns iter([i, i + 1, i + 2, ..., j - 1]);
    start (!) defaults to 0.  When step is given, it specifies the
    increment (or decrement).  For example, range(4) returns
    iter([0, 1, 2, 3]).  The end point is omitted!  These are exactly the
    valid elements for an array of 4 elements.

    ***/
    var start = 0;
    var stop = 0;
    var step = 1;
    if (arguments.length == 1) {
        stop = arguments[0];
    } else if (arguments.length == 2) {
        start = arguments[0];
        stop = arguments[1];
    } else if (arguments.length == 3) {
        start = arguments[0];
        stop = arguments[1];
        step = arguments[2];
    } else {
        throw TypeError("range() takes 1, 2, or 3 arguments!");
    }
    return {
        "next": function () {
            if (start >= stop) {
                throw MochiKit.Iter.StopIteration;
            }
            var rval = start;
            start += step;
            return rval;
        },
        "repr": function () {
            return "range(" + [start, stop, step].join(", ") + ")";
        },
        "toString": MochiKit.Base.forward("repr")
    };
};
        
MochiKit.Iter.sum = function (iterable, start/* = 0 */) {
    /***

    Returns the sum of a sequence of numbers (NOT strings) plus the value
    of parameter 'start' (with a default of 0).  When the sequence is
    empty, returns start.

    Equivalent to::

        reduce(operator.add, iterable, start);

    ***/
    var x = start ? start : 0;
    iterable = MochiKit.Iter.iter(iterable);
    try {
        while (true) {
            x += iterable.next();
        }
    } catch (e) {
        if (e != MochiKit.Iter.StopIteration) {
            throw e;
        }
        return x;
    }
};
        
MochiKit.Iter.exhaust = function (iterable) {
    /***

        Exhausts an iterable without saving the results anywhere,
        like list(iterable) when you don't care what the output is.

    ***/

    iterable = MochiKit.Iter.iter(iterable);
    try {
        while (true) {
            iterable.next();
        }
    } catch (e) {
        if (e != MochiKit.Iter.StopIteration) {
            throw e;
        }
    }
};

MochiKit.Iter.forEach = function (iterable, func, /* optional */self) {
    /***
    
        Call func for each item in iterable.

    ***/
    if (arguments.length > 2) {
        func = MochiKit.Base.bind(func, self);
    }
    // fast path for array
    if (MochiKit.Base.isArrayLike(iterable)) {
        for (var i = 0; i < iterable.length; i++) {
            func(iterable[i]);
        }
    } else {
        MochiKit.Iter.exhaust(MochiKit.Iter.imap(func, iterable));
    }
};

MochiKit.Iter.every = function (iterable, func) {
    /***

        Return true if func(item) is true for every item in iterable

    ***/
    try {
        MochiKit.Iter.ifilterfalse(func, iterable).next();
        return false;
    } catch (e) {
        if (e != MochiKit.Iter.StopIteration) {
            throw e;
        }
        return true;
    }
};

MochiKit.Iter.sorted = function (iterable, /* optional */cmp) {
    /***

        Return a sorted array from iterable

    ***/
    var rval = MochiKit.Iter.list(iterable);
    if (arguments.length == 1) {
        cmp = MochiKit.Base.compare;
    }
    rval.sort(cmp);
    return rval;
};

MochiKit.Iter.reversed = function (iterable) {
    /***

        Return a reversed array from iterable.

    ***/
    var rval = MochiKit.Iter.list(iterable);
    rval.reverse();
    return rval;
};

MochiKit.Iter.some = function (iterable, func) {
    /***

        Return true if func(item) is true for at least one item in iterable

    ***/
    try {
        MochiKit.Iter.ifilter(func, iterable).next();
        return true;
    } catch (e) {
        if (e != MochiKit.Iter.StopIteration) {
            throw e;
        }
        return false;
    }
};

MochiKit.Iter.iextend = function (lst, iterable) {
    /***
        
        Just like list(iterable), except it pushes results on lst
    
    ***/
    
    if (MochiKit.Base.isArrayLike(iterable)) {
        // fast-path for array-like
        for (var i = 0; i < iterable.length; i++) {
            lst.push(iterable[i]);
        }
    } else {
        iterable = MochiKit.Iter.iter(iterable);
        try {
            while (true) {
                lst.push(iterable.next());
            }
        } catch (e) {
            if (e != MochiKit.Iter.StopIteration) {
                throw e;
            }
        }
    }
    return lst;
};


MochiKit.Iter.arrayLikeIter = function (iterable) {
    var i = 0;
    return {
        "repr": function () { return "arrayLikeIter(...)"; },
        "toString": MochiKit.Base.forward("repr"),
        "next": function () {
            if (i >= iterable.length) {
                throw MochiKit.Iter.StopIteration;
            }
            return iterable[i++];
        }
    };
};


MochiKit.Iter.EXPORT_OK = [
    "iteratorRegistry",
    "arrayLikeIter"
];

MochiKit.Iter.EXPORT = [
    "StopIteration",
    "registerIteratorFactory",
    "iter",
    "count",
    "cycle",
    "repeat",
    "next",
    "izip",
    "ifilter",
    "ifilterfalse",
    "islice",
    "imap",
    "applymap",
    "chain",
    "takewhile",
    "dropwhile",
    "tee",
    "list",
    "reduce",
    "range",
    "sum",
    "exhaust",
    "forEach",
    "every",
    "sorted",
    "reversed",
    "some",
    "iextend"
];

MochiKit.Iter.__new__ = function () {
    this.StopIteration = new MochiKit.Base.NamedError("StopIteration");
    this.iteratorRegistry = new MochiKit.Base.AdapterRegistry();
    // Register the iterator factory for arrays
    this.registerIteratorFactory(
        "arrayLike",
        MochiKit.Base.isArrayLike,
        this.arrayLikeIter
    );

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": MochiKit.Base.concat(this.EXPORT, this.EXPORT_OK)
    };

    MochiKit.Base.nameFunctions(this);
        
};

MochiKit.Iter.__new__();

//
// XXX: Internet Explorer blows
//
reduce = MochiKit.Iter.reduce;

if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Iter);
}
