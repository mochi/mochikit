.. -*- mode: rst -*-

MochiKit.Iter
=============

Errors
------

StopIteration:
    The singleton NamedError that signifies the end of an iterator

Functions
---------

registerIteratorFactory(name, check, iterfactory[, override]):
    Register an iterator factory for use with the iter function.

    check is a function (a) that returns true if a can be converted
    into an iterator with iterfactory.

    iterfactory is a function (a) that returns an object with a
    "next" function that returns the next value in the sequence.

    iterfactory is guaranteed to only be called if check(a)
    returns a true value.

    If override is given and true, then it will be made the
    highest precedence iterator factory.  Otherwise, the lowest.

iter(iterable[, sentinel]):
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

count(n):
    count([n]) --> n, n + 1, n + 2, ...

cycle(p):
    cycle(p) --> p0, p1, ... plast, p0, p1, ...

repeat(elem[, n]):
    repeat(elem, [,n]) --> elem, elem, elem, ... endlessly or up to n times
        
next(iterator):
    Return the next value from the iterator

izip(p, q[, ...]):
    izip(p, q, ...) --> (p0, q0, ...), (p1, q1, ...), ...

ifilter(pred, seq):
    ifilter(pred, seq) --> elements of seq where pred(elem) is true

ifilterfalse(pred, seq):
    ifilterfalse(pred, seq) --> elements of seq where pred(elem) is false
 
islice(seq, [start,] stop[, step]):
    islice(seq, [start,] stop[, step])  --> elements from 
        seq[start:stop:step] (in Python slice syntax)

imap(fun, p, q[, ...]):
    imap(fun, p, q, ...) --> fun(p0, q0, ...), fun(p1, q1, ...), ...
    
applymap(fun, seq):
    applymap(fun, seq) --> fun.apply(this, seq0), fun.apply(this, seq1), ...

chain(p, q[, ...]):
    chain(p, q, ...) --> p0, p1, ... plast, q0, q1, ...

takewhile(pred, seq):
    takewhile(pred, seq) --> seq[0], seq[1], ... until pred(seq[n]) fails

dropwhile(pred, seq):
    dropwhile(pred, seq) --> seq[n], seq[n + 1], starting when
        pred(seq[n]) fails

tee(iterable, n=2):
    tee(it, n=2) --> [it1, it2, it3, ... itn] splits one iterator into n

list(iterable):
    Convert an iterable to a new array

reduce(fn, iterable[, initial]):
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

range([start,] stop[, step]):
    Return an iterator containing an arithmetic progression of integers.
    range(i, j) returns iter([i, i + 1, i + 2, ..., j - 1]);
    start (!) defaults to 0.  When step is given, it specifies the
    increment (or decrement).  For example, range(4) returns
    iter([0, 1, 2, 3]).  The end point is omitted!  These are exactly the
    valid elements for an array of 4 elements.
        
sum(iterable, start=0):
    Returns the sum of a sequence of numbers (NOT strings) plus the value
    of parameter 'start' (with a default of 0).  When the sequence is
    empty, returns start.

    Equivalent to::

        reduce(operator.add, iterable, start);
        
exhaust(iterable):
    Exhausts an iterable without saving the results anywhere,
    like list(iterable) when you don't care what the output is.

forEach(iterable, func[, self]):
    Call func for each item in iterable.

every(iterable, func):
    Return true if func(item) is true for every item in iterable

sorted(iterable[, cmp]):
    Return a sorted array from iterable

reversed(iterable):
    Return a reversed array from iterable.

some(iterable, func):
    Return true if func(item) is true for at least one item in iterable

iextend(lst, iterable):
    Just like list(iterable), except it pushes results on lst
