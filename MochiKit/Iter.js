var StopIteration = new Error("StopIteration");
var _ITERATORS = new AdapterRegistry();

function registerIteratorFactory(name, check, iterfactory, /* optional */ override) {
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

    _ITERATORS.register(name, check, iterfactory, override);
}

function iter(iterable, /* optional */ sentinel) {
    /***

        Convert the given argument to an iterator (object implementing "next").
        
        1. If iterable is an iterator (implements "next"), then it will be
           returned as-is.
        2. If iterable is an iterator factory (implements "iter"), then the
           result of iterable.iter() will be returned.
        3. Otherwise, the iterator factory registry is used to find a match.
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
        return takewhile(
            function (a) { return a != sentinel; },
            iterable);
    }
    if (typeof(iterable.next) == 'function') {
        return iterable;
    } else if (typeof(iterable.iter) == 'function') {
        return iterable.iter();
    }
    try {
        return _ITERATORS.match(iterable);
    } catch (e) {
        if (e == NotFound) {
            e = new TypeError(repr(iterable) + " is not iterable");
        }
        throw e;
    }
}

// Register the iterator factory for arrays
registerIteratorFactory("arrayLike", isArrayLike, function (iterable) {
    var i = 0;
    return {
        "repr": function () { return "arrayLikeIter(...)"; },
        "toString": forward("repr"),
        "next": function () {
            if (i >= iterable.length) {
                throw StopIteration;
            }
            return iterable[i++];
        }
    };
});

function count(n) {
    /***

        count([n]) --> n, n + 1, n + 2, ...

    ***/
    if (!n) {
        n = 0;
    }
    return {
        "repr": function () { return "count(" + n + ")"; },
        "toString": forward("repr"),
        "next": function () { return n++; }
    };
}

function cycle(p) {
    /***

        cycle(p) --> p0, p1, ... plast, p0, p1, ...

    ***/
    var lst = [];
    var iterator = iter(p);
    return {
        "repr": function () { return "cycle(...)"; },
        "toString": forward("repr"),
        "next": function () {
            try {
                var rval = iterator.next();
                lst.push(rval);
                return rval;
            } catch (e) {
                if (e != StopIteration) {
                    throw e;
                }
                if (lst.length == 0) {
                    this.next = function () { throw StopIteration; };
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
}

function repeat(elem, /* optional */n) {
    /***
    
        repeat(elem, [,n]) --> elem, elem, elem, ... endlessly or up to n times

    ***/
    if (typeof(n) == 'undefined') {
        return {
            "repr": function () { return "repeat(" + repr(elem) + ")"; },
            "toString": forward("repr"),
            "next": function () { return elem; }
        };
    }
    return {
        "repr": function () { return "repeat(" + repr(elem) + ", " + n + ")"; },
        "toString": forward("repr"),
        "next": function () {
            if (n <= 0) {
                throw StopIteration;
            }
            n -= 1;
            return elem;
        }
    };
}
        
function next(iterator) {
    /***

        Return the next value from the iterator

    ***/
    return iterator.next();
}

function izip(p, q/*, ...*/) {
    /***

        izip(p, q, ...) --> (p0, q0, ...), (p1, q1, ...), ...

    ***/
    var iterables = map(iter, arguments);
    return {
        "repr" : function () { return "izip(...)"; },
        "toString" : forward("repr"),
        "next": function () { return map(next, iterables); }
    };
}

function ifilter(pred, seq) {
    /***

        ifilter(pred, seq) --> elements of seq where pred(elem) is true

    ***/
    var seq = iter(seq);
    if (pred == null) {
        pred = operator.truth;
    }
    return {
        "repr": function () { return "ifilter(...)"; },
        "toString": forward("repr"),
        "next": function () {
            while (true) {
                var rval = seq.next();
                if (pred(rval)) {
                    return rval;
                }
            }
        }
    }
}

function ifilterfalse(pred, seq) {
    /***

        ifilterfalse(pred, seq) --> elements of seq where pred(elem) is false

    ***/
    var seq = iter(seq);
    if (pred == null) {
        pred = operator.truth;
    }
    return {
        "repr": function () { return "ifilterfalse(...)"; },
        "toString": forward("repr"),
        "next": function () {
            while (true) {
                var rval = seq.next();
                if (!pred(rval)) {
                    return rval;
                }
            }
        }
    }
}
 
function islice(seq/*, [start,] stop[, step] */) {
    /***

        islice(seq, [start,] stop[, step])  --> elements from 
            seq[start:stop:step] (in Python slice syntax)

    ***/
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
        "toString": forward("repr"),
        "next": function () {
            var rval;
            while (i < start) {
                rval = seq.next();
                i++;
            }
            if (start >= stop) {
                throw StopIteration;
            }
            start += step;
            return rval;
        }
    };
}

function imap(fun, p, q/*, ...*/) {
    /***

        imap(fun, p, q, ...) --> fun(p0, q0, ...), fun(p1, q1, ...), ...

    ***/
    var iterables = map(iter, extend(null, arguments, 1));
    return {
        "repr": function () { return "imap(...)"; },
        "toString": forward("repr"),
        "next": function () {
            return fun.apply(this, map(next, iterables));
        }
    };
}
    
function applymap(fun, seq) {
    /***

        applymap(fun, seq) -->
            fun.apply(this, seq0), fun.apply(this, seq1), ...

    ***/
    seq = iter(seq);
    return {
        "repr": function () { return "applymap(...)"; },
        "toString": forward("repr"),
        "next": function () {
            return fun.apply(this, seq.next());
        }
    };
}

function chain(p, q/*, ...*/) {
    /***

        chain(p, q, ...) --> p0, p1, ... plast, q0, q1, ...

    ***/
    // dumb fast path
    if (arguments.length == 1) {
        return iter(arguments[0]);
    }
    var argiter = map(iter, arguments);
    return {
        "repr": function () { return "chain(...)"; },
        "toString": forward("repr"),
        "next": function () {
            while (argiter.length > 1) {
                try {
                    return argiter[0].next();
                } catch (e) {
                    if (e != StopIteration) {
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
            throw StopIteration;
        }
    };
}

function takewhile(pred, seq) {
    /***

        takewhile(pred, seq) --> seq[0], seq[1], ... until pred(seq[n]) fails

    ***/
    seq = iter(seq);
    return {
        "repr": function () { return "takewhile(...)"; },
        "toString": forward("repr"),
        "next": function () {
            var rval = seq.next();
            if (!pred(rval)) {
                this.next = function () { throw StopIteration; };
                throw StopIteration;
            }
            return rval;
        }
    };
}

function dropwhile(pred, seq) {
    /***

        dropwhie(pred, seq) --> seq[n], seq[n + 1], starting when
            pred(seq[n]) fails

    ***/
    seq = iter(seq);
    return {
        "repr": function () { return "dropwhile(...)"; },
        "toString": forward("repr"),
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
}

function _tee(ident, sync, iterable) {
    sync.pos[ident] = -1;
    return {
        "repr": function () { return "tee(" + ident + ", ...)"; },
        "toString": forward("repr"),
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
}

function tee(iterable, n/* = 2 */) {
    /***

        tee(it, n=2) --> (it1, it2, it3, ... itn) splits one iterator into n

    ***/
    var rval = [];
    var sync = {"pos": [], "deque": [], "max": -1, "min": -1};
    if (arguments.length == 1) {
        n = 2;
    }
    iterable = iter(iterable);
    for (var i = 0; i < n; i++) {
        rval.push(_tee(i, sync, iterable));
    }
    return rval;
}

function list(iterable) {
    /***

        Convert an iterable to a new array

    ***/

    // Fast-path for Array and Array-like
    if (typeof(iterable.slice) == 'function') {
        return iterable.slice();
    } else if (isArrayLike(iterable)) {
        return concat(iterable);
    }

    iterable = iter(iterable);
    var rval = [];
    try {
        while (true) {
            rval.push(iterable.next());
        }
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
        return rval;
    }
}

    
function reduce(fn, iterable, /* optional */initial) {
    /***
    
        Apply a function fn(a, b) cumulatively to the items of an iterable 
        from left to right, so as to reduce the iterable to a single value.
        For example, reduce(function (a, b) { return x + y; }, [1, 2, 3, 4, 5])
        calculates ((((1 + 2) + 3) + 4) + 5).  If initial is given, it is
        placed before the items of the sequence in the calculation, and
        serves as a default when the sequence is empty.

        Note that the above example could be written more clearly as:

            reduce(operator.add, [1, 2, 3, 4, 5])

        Or even simpler:

            sum([1, 2, 3, 4, 5])

    ***/
    var i = 0;
    var x = initial;
    iterable = iter(iterable);
    if (typeof(x) == 'undefined') {
        x = iterable.next();
        i++;
    }
    try {
        while (true) {
            x = fn(x, iterable.next());
        }
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
        return x;
    }
}

function range(/* [start,] stop[, step] */) {
    /***

    Return an iterator containing an arithmetic progression of integers.
    range(i, j) returns iter([i, i + 1, i + 2, ..., j - 1]);
    start (!) defaults to 0.  When step is given, it specifies the increment
    (or decrement).  For example, range(4) returns iter([0, 1, 2, 3]).  The
    end point is omitted!  These are exactly the valid elements for an array
    of 4 elements.

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
                throw StopIteration;
            }
            var rval = start;
            start += step;
            return rval;
        },
        "repr": function () {
            return "range(" + [start, stop, step].join(", ") + ")";
        },
        "toString": forward("repr")
    };
}
        
function sum(iterable, start/* = 0 */) {
    /***

    Returns the sum of a sequence of numbers (NOT strings) plus the value
    of parameter 'start' (with a default of 0).  When the sequence is empty,
    returns start.

    Equivalent to::

        reduce(operator.add, iterable, start);

    ***/
    var x = start ? start : 0;
    iterable = iter(iterable);
    try {
        while (true) {
            x += iterable.next();
        }
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
        return x;
    }
}
        
function exhaust(iterable) {
    /***

        Exhausts an iterable without saving the results anywhere,
        like list(iterable) when you don't care what the output is.

    ***/

    iterable = iter(iterable);
    try {
        while (true) {
            iterable.next();
        }
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
    }
}

function forEach(iterable, func, /* optional */self) {
    /***
    
        Call func for each item in iterable.

    ***/
    if (arguments.length > 2) {
        func = bind(func, self);
    }
    exhaust(imap(func, iterable));
}

function every(iterable, func) {
    /***

        Return true if func(item) is true for every item in iterable

    ***/
    try {
        ifilterfalse(func, iterable).next();
        return false;
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
        return true;
    }
}

function sorted(iterable, /* optional */cmp) {
    /***

        Return a sorted array from iterable

    ***/
    var rval = list(iterable);
    if (arguments.length == 1) {
        cmp = compare;
    }
    rval.sort(cmp);
    return rval;
}

function reversed(iterable) {
    /***

        Return a reversed array from iterable.

    ***/
    var rval = list(iterable);
    rval.reverse();
    return rval;
}

function some(iterable, func) {
    /***

        Return true if func(item) is true for at least one item in iterable

    ***/
    try {
        ifilter(func, iterable).next();
        return true;
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
        return false;
    }
}

function iextend(lst, iterable) {
    /***
        
        Just like list(iterable), except it pushes results on lst
    
    ***/
    
    iterable = iter(iterable);
    try {
        while (true) {
            lst.push(iterable.next());
        }
    } catch (e) {
        if (e != StopIteration) {
            throw e;
        }
    }
    return lst;
}
