.. -*- mode: rst -*-

MochiKit.Base
=============

Errors
------

NamedError:
    Used to create new errors (e.g. NotFound)

NotFound:
    A singleton error raised when no suitable adapter is found

Constructors
------------

AdapterRegistry:
    A registry to facilitate adaptation.

    All check/wrap functions in this registry should be of the same arity.

AdapterRegistry.prototype.register(name, check, wrap[, override]):
    The check function should return true if the given arguments are
    appropriate for the wrap function.

    If override is given and true, the check function will be given
    highest priority.  Otherwise, it will be the lowest priority
    adapter.

AdapterRegistry.prototype.match(obj[, ...]):
    Find an adapter for the given arguments.
    
    If no suitable adapter is found, throws NotFound.

AdapterRegistry.prototype.unregister(name):
    Remove a named adapter from the registry


Functions
---------

extend(self, obj[, skip]):
    Mutate an array by extending it with an array-like obj,
    starting with the "skip" index of obj.  If null is given
    as the initial array, a new one will be created.

    This mutates *and returns* the given array, be warned.

update(self, obj[, ...]):
    Mutate an object by replacing its key:value pairs with those
    from other object(s).  Key:value pairs from later objects will
    overwrite those from earlier objects.
    
    If null is given as the initial object, a new one will be created.

    This mutates *and returns* the given object, be warned.

    A version of this function that creates a new object is available
    as merge(o1, o2, ...)

setdefault(self, obj[, ...]):
    Mutate an object by replacing its key:value pairs with those
    from other object(s) IF they are not already set on the initial
    object.
    
    If null is given as the initial object, a new one will be created.

    This mutates *and returns* the given object, be warned.

keys(obj):
    Return an array of the property names of an object
    (in no particular order).
    
items(obj):
    Return an array of [propertyName, propertyValue] pairs for an
    object (in no particular order).

operator:
    A table of JavaScript's operators for usage with map, filter, etc.

    =============== =================== ===============================
                    Unary Logic Operators
    -------------------------------------------------------------------
    Operator        Implementation  Description
    =============== =================== ===============================
    truth(a)        !!a                 Logical truth
    lognot(a)       !a                  Logical not
    identity(a)     a                   Logical identity
    =============== =================== ===============================

    =============== =================== ===============================
                       Unary Math Operators
    -------------------------------------------------------------------
    Operator        Implementation  Description
    =============== =================== ===============================
    not(a)          ~a                  Bitwise not
    neg(a)          -a                  Negation
    =============== =================== ===============================

    =============== =================== ===============================
                        Binary Operators
    -------------------------------------------------------------------
    Operator        Implementation  Description
    =============== =================== ===============================
    add(a, b)       a + b               Addition
    div(a, b)       a / b               Division
    mod(a, b)       a % b               Modulus
    and(a, b)       a & b               Bitwise and
    or(a, b)        a | b               Bitwise or
    xor(a, b)       a ^ b               Bitwise exclusive or
    lshift(a, b)    a << b              Bitwise left shift
    rshift(a, b)    a >> b              Bitwise signed right shift
    zrshfit(a, b)   a >>> b             Bitwise unsigned right shift
    =============== =================== ===============================

    =============== =================== ===============================
                        Built-in Comparators
    -------------------------------------------------------------------
    Operator        Implementation      Description
    =============== =================== ===============================
    eq(a, b)        a == b              Equals
    ne(a, b)        a != b              Not equals
    gt(a, b)        a > b               Greater than
    ge(a, b)        a >= b              Greater than or equal to
    lt(a, b)        a < b               Less than
    le(a, b)        a <= b              Less than or equal to
    =============== =================== ===============================

    =============== =================== ===============================
                Extended Comparators (uses compare)
    -------------------------------------------------------------------
    Operator        Implementation      Description
    =============== =================== ===============================
    ceq(a, b)       compare(a, b) == 0  Equals
    cne(a, b)       compare(a, b) != 0  Not equals
    cgt(a, b)       compare(a, b) == 1  Greater than
    cge(a, b)       compare(a, b) != -1 Greater than or equal to
    clt(a, b)       compare(a, b) == -1 Less than
    cle(a, b)       compare(a, b) != 1  Less than or equal to
    =============== =================== ===============================

    =============== =================== ===============================
                Binary Logical Operators
    -------------------------------------------------------------------
    Operator        Implementation      Description
    =============== =================== ===============================
    logand(a, b)    a && b              Logical and
    logor(a, b)     a || b              Logical or
    contains(a, b)  b in a              Has property (note order)
    =============== =================== ===============================

forward(name):
    Returns a function that forwards a method call to this.name(...)

itemgetter(name):
    Returns a function(obj) that returns obj[name]

typeMatcher(typ[, ...]):
    Given a set of types (as string arguments),
    returns a function(obj[, ...]) that will return true if the
    types of the given arguments are all members of that set.

isNull(obj[, ...]):
    Returns true if all arguments are null.

isUndefinedOrNull(obj[, ...]):
    Returns true if all arguments are undefined or null

isNotEmpty(obj[, ...]):
    Returns true if all the given array or string arguments
    are not empty (obj.length > 0)

isArrayLike(obj[, ...]):
    Returns true if all given arguments are Array-like

isDateLike(obj[, ...]):
    Returns true if all given arguments are Date-like

xmap(fn, obj[, ...):
    Return an array composed of fn(obj) for every obj given as an
    argument.

    If fn is null, operator.identity is used.

map(fn, lst[, ...]):
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

xfilter(fn, obj[, ...]):
    Returns a new array composed of the arguments where
    fn(obj) returns a true value.

    If fn is null, operator.truth will be used.

filter(fn, lst):
    Returns a new array composed of elements from lst where
    fn(lst[i]) returns a true value.

    If fn is null, operator.truth will be used.

bind(func, self):
    Return a copy of func bound to self.  This means whenever
    and however the return value is called, "this" will always
    reference the given "self".

    Calling bind(func, self) on an already bound function will
    return a new function that is bound to the new self.

bindMethods(self):
    Bind all functions in self to self,
    which gives you a semi-Pythonic sort of instance.

registerComparator(name, check, comparator[, override]):
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

compare(a, b):
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

registerRepr(name, check, wrap[, override]):
    Register a repr function.  repr functions should take
    one argument and return a string representation of it
    suitable for developers, primarily used when debugging.

    If override is given, it is used as the highest priority
    repr, otherwise it will be used as the lowest.

repr(o):
    Return a "programmer representation" for an object

objEqual(a, b):
    Compare the equality of two objects.

arrayEqual(self, arr):
    Compare two arrays for equality, with a fast-path for length
    differences.

concat(lst[, ...]):
    Concatenates all given array-like arguments and returns
    a new array::

        var lst = concat(["1","3","5"], ["2","4","6"]);
        assert(lst.toString() == "1,3,5,2,4,6");

keyComparator(key[, ...]):
    A comparator factory that compares a[key] with b[key].
    e.g.:

        var lst = ["a", "bbb", "cc"];
        lst.sort(keyComparator("length"));
        assert(lst.toString() == "a,cc,bbb");

reverseKeyComparator(key):
    A comparator factory that compares a[key] with b[key] in reverse.
    e.g.:

        var lst = ["a", "bbb", "cc"];
        lst.sort(reverseKeyComparator("length"));
        assert(lst.toString() == "bbb,cc,aa");

partial(func, arg[, ...]):
    Return a partially applied function, e.g.::

        addNumbers = function (a, b) {
            return a + b;
        }

        addOne = partial(addNumbers, 1);

        assert(addOne(2) == 3);

    NOTE: This could be used to implement, but is NOT currying.
 
listMinMax(which, lst):
    If which == -1 then it will return the smallest
    element of the array-like lst.  This is also available
    as::

        listMin(lst)


    If which == 1 then it will return the largest
    element of the array-like lst.  This is also available
    as::
        
        listMax(list)

objMax(obj[, ...]):
    Return the maximum object out of the given arguments
        
objMin(obj[, ...]):
    Return the minimum object out of the given arguments

nodeWalk(node, visitor):
    Non-recursive generic node walking function (e.g. for a DOM)

    node:
        The initial node to be searched.

    visitor:
        The visitor function, will be called as
        visitor(node), and should return an Array-like
        of notes to be searched next (e.g.  node.childNodes).

nameFunctions(namespace):
    Given a namespace with a NAME property, find all functions in it and
    give them nice NAME properties too.  e.g.::

        namespace = {
            NAME: "Awesome",
            Dude: function () {}
        }
        nameFunctions(namespace);
        assert( namespace.Dude.NAME == 'Awesome.Dude' );
