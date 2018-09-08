/***

MochiKit.Iter 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

MochiKit.Base.module(MochiKit, 'Iter', '1.5', ['Base']);

MochiKit.Base.update(MochiKit.Iter, {
    /** @id MochiKit.Iter.registerIteratorFactory */
    registerIteratorFactory: function (name, check, iterfactory, /* optional */ override) {
        MochiKit.Iter.iteratorRegistry.register(name, check, iterfactory, override);
    },

    /** @id MochiKit.Iter.iter */
    iter: function (iterable, /* optional */ sentinel) {
        var self = MochiKit.Iter;
        if (arguments.length == 2) {
            return self.takewhile(
                function (a) { return a != sentinel; },
                iterable
            );
        }
        if (typeof(iterable.next) == 'function') {
            return iterable;
        } else if (typeof(iterable.iter) == 'function') {
            return iterable.iter();
        /*
        }  else if (typeof(iterable.__iterator__) == 'function') {
            //
            // XXX: We can't support JavaScript 1.7 __iterator__ directly
            //      because of Object.prototype.__iterator__
            //
            return iterable.__iterator__();
        */
        }

        try {
            return self.iteratorRegistry.match(iterable);
        } catch (e) {
            var m = MochiKit.Base;
            if (e == m.NotFound) {
                e = new TypeError(typeof(iterable) + ": " + m.repr(iterable) + " is not iterable");
            }
            throw e;
        }
    },

    /** @id MochiKit.Iter.izip */
    izip: function (p, q/*, ...*/) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        var next = self.next;
        var iterables = m.map(self.iter, arguments);
        return {
            repr: function () { return "izip(...)"; },
            toString: m.forwardCall("repr"),
            next: function () { return m.map(next, iterables); }
        };
    },

    /** @id MochiKit.Iter.imap */
    imap: function (fun, p, q/*, ...*/) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        var iterables = m.map(self.iter, m.extend(null, arguments, 1));
        var map = m.map;
        var next = self.next;
        return {
            repr: function () { return "imap(...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
                return fun.apply(this, map(next, iterables));
            }
        };
    },

    /** @id MochiKit.Iter.takewhile */
    takewhile: function (pred, seq) {
        var self = MochiKit.Iter;
        seq = self.iter(seq);
        return {
            repr: function () { return "takewhile(...)"; },
            toString: MochiKit.Base.forwardCall("repr"),
            next: function () {
                var rval = seq.next();
                if (!pred(rval)) {
                    this.next = function () {
                        throw self.StopIteration;
                    };
                    this.next();
                }
                return rval;
            }
        };
    },

    /** @id MochiKit.Iter.dropwhile */
    dropwhile: function (pred, seq) {
        seq = MochiKit.Iter.iter(seq);
        var m = MochiKit.Base;
        var bind = m.bind;
        return {
            "repr": function () { return "dropwhile(...)"; },
            "toString": m.forwardCall("repr"),
            "next": function () {
                while (true) {
                    var rval = seq.next();
                    if (!pred(rval)) {
                        break;
                    }
                }
                this.next = bind("next", seq);
                return rval;
            }
        };
    },

    _tee: function (ident, sync, iterable) {
        sync.pos[ident] = -1;
        var m = MochiKit.Base;
        var listMin = m.listMin;
        return {
            repr: function () { return "tee(" + ident + ", ...)"; },
            toString: m.forwardCall("repr"),
            next: function () {
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
    },

    /** @id MochiKit.Iter.tee */
    tee: function (iterable, n/* = 2 */) {
        var rval = [];
        var sync = {
            "pos": [],
            "deque": [],
            "max": -1,
            "min": -1
        };
        if (arguments.length == 1 || typeof(n) == "undefined" || n === null) {
            n = 2;
        }
        var self = MochiKit.Iter;
        iterable = self.iter(iterable);
        var _tee = self._tee;
        for (var i = 0; i < n; i++) {
            rval.push(_tee(i, sync, iterable));
        }
        return rval;
    },

    /** @id MochiKit.Iter.groupby */
    groupby: function(iterable, /* optional */ keyfunc) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (arguments.length < 2) {
            keyfunc = m.operator.identity;
        }
        iterable = self.iter(iterable);

        // shared
        var pk = undefined;
        var k = undefined;
        var v;

        function fetch() {
            v = iterable.next();
            k = keyfunc(v);
        };

        function eat() {
            var ret = v;
            v = undefined;
            return ret;
        };

        var first = true;
        var compare = m.compare;
        return {
            repr: function () { return "groupby(...)"; },
            next: function() {
                // iterator-next

                // iterate until meet next group
                while (compare(k, pk) === 0) {
                    fetch();
                    if (first) {
                        first = false;
                        break;
                    }
                }
                pk = k;
                return [k, {
                    next: function() {
                        // subiterator-next
                        if (v == undefined) { // Is there something to eat?
                            fetch();
                        }
                        if (compare(k, pk) !== 0) {
                            throw self.StopIteration;
                        }
                        return eat();
                    }
                }];
            }
        };
    },

    /** @id MochiKit.Iter.groupby_as_array */
    groupby_as_array: function (iterable, /* optional */ keyfunc) {
        var m = MochiKit.Base;
        var self = MochiKit.Iter;
        if (arguments.length < 2) {
            keyfunc = m.operator.identity;
        }

        iterable = self.iter(iterable);
        var result = [];
        var first = true;
        var prev_key;
        var compare = m.compare;
        while (true) {
            try {
                var value = iterable.next();
                var key = keyfunc(value);
            } catch (e) {
                if (e == self.StopIteration) {
                    break;
                }
                throw e;
            }
            if (first || compare(key, prev_key) !== 0) {
                var values = [];
                result.push([key, values]);
            }
            values.push(value);
            first = false;
            prev_key = key;
        }
        return result;
    },

    /** @id MochiKit.Iter.hasIterateNext */
    hasIterateNext: function (iterable) {
        return (iterable && typeof(iterable.iterateNext) == "function");
    },

    /** @id MochiKit.Iter.iterateNextIter */
    iterateNextIter: function (iterable) {
        return {
            repr: function () { return "iterateNextIter(...)"; },
            toString: MochiKit.Base.forwardCall("repr"),
            next: function () {
                var rval = iterable.iterateNext();
                if (rval === null || rval === undefined) {
                    throw MochiKit.Iter.StopIteration;
                }
                return rval;
            }
        };
    }
});


MochiKit.Iter.__new__ = function () {
    var m = MochiKit.Base;
    // Re-use StopIteration if exists (e.g. SpiderMonkey)
    if (typeof(StopIteration) != "undefined") {
        this.StopIteration = StopIteration;
    } else {
        /** @id MochiKit.Iter.StopIteration */
        this.StopIteration = new m.NamedError("StopIteration");
    }
    this.iteratorRegistry = new m.AdapterRegistry();
    // Register the iterator factory for arrays
    this.registerIteratorFactory(
        "arrayLike",
        m.isArrayLike,
        this.arrayLikeIter
    );

    this.registerIteratorFactory(
        "iterateNext",
        this.hasIterateNext,
        this.iterateNextIter
    );

    m.nameFunctions(this);

};

MochiKit.Iter.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Iter);
