if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}
MochiKit.Class = {};
MochiKit.Class.NAME = 'MochiKit.Class';
MochiKit.Class.VERSION = '0.5';
MochiKit.Class.toString = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}
MochiKit.Class.EXPORT = [];
MochiKit.Class.EXPORT_OK = ['subclass'];
MochiKit.Class.EXPORT_TAGS = {
    ':all': MochiKit.Class.EXPORT_OK,
    ':common': MochiKit.Class.EXPORT
};

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
    }
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

        var proto = new superClass(__clone__);
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
                proto[k] = body[k];
            }
        }
        proto.__id__ = ++instanceCounter;
        proto.__class__ = rval;
        proto.__super__ = function (methName) {
            var args = [];
            for (var i = 1; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            superClass.prototype[methName].apply(this, args);
        };
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
