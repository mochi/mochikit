if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}
MochiKit.Class = {};
MochiKit.Class.NAME = 'MochiKit.Class';
MochiKit.Class.VERSION = '0.5';
MochiKit.Class.toString = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}
MochiKit.Class.EXPORT = ['subclass'];
MochiKit.Class.EXPORT_OK = [];
MochiKit.Class.EXPORT_TAGS = {
    ':all': MochiKit.Class.EXPORT,
    ':common': MochiKit.Class.EXPORT
};

MochiKit.Class.subclass = function (name, /* optional */superClass, body) {
    /***

    Returns ``newClass``, a function suitable for the ``new`` operator,
    given a name, optional base class (default is ``Object``), and optional
    body.
    
    ``newClass.NAME`` will be set to the given name, and this value will be
    used in the default repr and toString implementations for ``newClass``.

    ``superClass`` may be any function, or not given (``null`` or
    ``undefined``).  If ``superClass`` was not given, then ``Object`` will
    be used for ``superClass``.  If the given ``superClass`` was originally
    constructed with this function, then the prototype for the new class will
    be constructed in such a way that the ``initialize`` function does not
    get called, otherwise ``superClass`` will simply be constructed with no
    arguments.  ``newClass.__super__`` will be set to ``superClass``.

    ``body`` may be any object or not given.  If given, all enumerable
    properties from ``body`` are propogated to the prototype of ``newClass``.
    This is effectively a shortcut, allowing you to write this::

        //
        // NOTE:  You should always use this style whenever possible,
        //        see the caveats below if you don't!
        //
        myClass = MochiKit.Class.subclass("myClass", Object, {
            "initialize": function () {
                // my initialize function
            }
        });

    Instead of::

        //
        // NOTE:  If you use this style, you will not be
        //        able to use arguments.callee.nextMethod from these
        //        functions, and you will have to explicitly call a
        //        superclass implementation!
        // 
        myClass = MochiKit.Class.subclass("myClass", Object);
        myClass.prototype.initialize = function () {
            // my initialize function
        };


    Instances of ``newClass`` obey idiomatic JavaScript rules,
    most notably::
    
        newClass = MochiKit.Class.subclass("myClass", superClass);
        var inst = new newClass();
        if (inst instanceof newClass && inst instanceof superClass) {
            // this is true
        }

    This means that the lookup chain, etc. will also behave as expected,
    with no weird quirks (i.e. the classes aren't "static").
    
    Since ``MochiKit.Class.subclass`` is providing the constructor
    for you, you must put any initialization code in a method
    named ``initialize``.  This may be passed as part of the body
    object.

    Instances of ``newClass`` will always have a default ``__repr__``
    and ``toString`` that reflect a unique instance number and the
    name of ``newClass``.  A reference to ``newClass`` is present as
    ``__class__``, and the unique identifier is ``__id__``.

    In order to call the "super" implementation of a function, you
    should use the following idiom::

        newClass = MochiKit.Class.subclass("newClass", superClass, {
            "initialize": function (arg1, arg2, arg3) {
                // superClass (or one of its super classes) MUST
                // implement initialize, or you will
                // get a TypeError!
                arguments.callee.getNextMethod().apply(this, arguments);
                //
                // OR:
                //
                // arguments.callee.nextMethod(this)(arg1, arg2, arg3);
                ...
            }
        });

    Yes, this is absolutely tedious.  However, since the body methods have
    no reference to the class in which they are defined, it's not currently
    possible to determine what the "super" method is using a non-explicit
    mechanism.  We're looking into a good solution to this issue.

    ***/
    

    // see __new__ for the implementation, there' s a fair amount of private
    // variables in that scope.
    throw "Documentation stub";
}

MochiKit.Class.__new__ = function () {
    // private token, naked unique object
    var __clone__ = {};
    // the incrementing counter for instances created
    var instanceCounter = 0;
    // This is the representation of class objects
    var classToString = function () {
        return "[MochiKit.Class " + this.NAME + "]";
    };
    // Representation of instance objects
    var instanceToString = function () {
        return "[" + this.__class__.NAME + " #" + this.__id__ + "]";
    };
    var forwardToRepr = function () {
        return this.__repr__();
    };
    var copyFunction = function (func) {
        var callFunc = func.__orig__;
        if (typeof(callFunc) == 'undefined') {
            callFunc = func;
        }
        var newFunc = function () {
            return callFunc.apply(this, arguments);
        }
        for (var k in func) {
            newFunc[k] = func[k];
        }
        newFunc.__orig__ = callFunc;
        return newFunc;
    };

    var getNextMethod = function (self) {
        var next_method = null;
        try {
            return this.__class__.superClass.prototype[this.__name__];
        } catch (e) {
            throw new TypeError("no super method for " + this.NAME);
        }
    }
        
    var nextMethod = function (self) {
        var next_method = this.getNextMethod();
        return function () {
            return next_method.apply(self, arguments);
        };
    };

    this.subclass = function (name, /* optional */superClass, body) {
        // allow superClass to be null or undefined
        if (!superClass) {
            superClass = Object;
        }

        // this is the constructor we're going to return
        var rval = function (arg) {
            // allow for "just call" syntax to create objects
            var o = this;
            if (!(o instanceof rval)) {
                o = new rval(__clone__);
            } else {
                o.__id__ = ++instanceCounter;
            }
            // don't initialize when using the stub method!
            if (arg != __clone__) {
                if (typeof(o.initialize) == 'function') {
                    o.initialize.apply(o, arguments);
                }
            }
            return o;
        };
        rval.NAME = name;
        rval.superClass = superClass;
        rval.toString = forwardToRepr;
        rval.__repr__ = classToString;
        rval.__MochiKit_Class__ = true;

        var proto = null;
        if (superClass.__MochiKit_Class__) {
            proto = new superClass(__clone__);
        } else {
            proto = new superClass();
        }

        if (typeof(proto.toString) == 'undefined' || (proto.toString == Object.prototype.toString)) {
            proto.toString = instanceToString;
        }
        if (typeof(proto.__repr__) == 'undefined') {
            proto.__repr__ = instanceToString;
        }
        if (proto.toString == Object.prototype.toString) {
            proto.toString = forwardToRepr;
        }
        if (typeof(body) != 'undefined' && body != null) {
            for (var k in body) {
                var o = body[k];
                if (typeof(o) == 'function' && typeof(o.__MochiKit_Class__) == 'undefined') {
                    if (typeof(o.__class__) != 'undefined') {
                        o = copyFunction(o);
                    }
                    o.__class__ = rval;
                    o.__name__ = k;
                    o.NAME = rval.NAME + '.' + k;
                    o.nextMethod = nextMethod;
                    o.getNextMethod = getNextMethod;
                }
                proto[k] = o;
            }
        }
        proto.__id__ = ++instanceCounter;
        proto.__class__ = rval;
        rval.prototype = proto;
        return rval;
    };
    this.subclass.NAME = this.NAME + "." + "subclass";
};

MochiKit.Class.__new__();

if (typeof(JSAN) == 'undefined'
    || typeof(__MochiKit_Compat__) == 'boolean' && __MochiKit_Compat__) {
    (function (self) {
        var all = self.EXPORT_TAGS[":all"];
        for (var i = 0; i < all.length; i++) {
            this[all[i]] = self[all[i]];
        }
    })(MochiKit.Class);
}
