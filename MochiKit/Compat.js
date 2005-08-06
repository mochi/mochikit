if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Compat');
}
if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}
if (typeof(MochiKit.Compat) == 'undefined') {
    MochiKit.Compat = {};
}

MochiKit.Compat.NAME = 'MochiKit.Compat';
MochiKit.Compat.VERSION = '0.80';
MochiKit.Compat.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};
MochiKit.Compat.toString = function () {
    return this.__repr__();
};

if (!Array.prototype.push) {
    Array.prototype.push = function() {
        var startLength = this.length;
        for (var i = 0; i < arguments.length; i++) {
            this[startLength + i] = arguments[i];
        }
        return this.length;
    };
}

if (!Function.prototype.apply) {
    // Based on code from http://www.youngpup.net/
    Function.prototype.apply = function(object, parameters) {
        var parameterStrings = [];
        if (!object) {
            object = window;
        }
        if (!parameters) {
            parameters = [];
        }
        for (var i = 0; i < parameters.length; i++) {
            parameterStrings[i] = 'parameters[' + i + ']';
        }

        object.__apply__ = this;
        var result = eval(
            'object.__apply__(' + 
            parameterStrings.join(', ') +
            ')'
        );
        object.__apply__ = null;

        return result;
    };
}

MochiKit.Compat.EXPORT = [];
MochiKit.Compat.EXPORT_OK = [];
MochiKit.Compat.EXPORT_TAGS = {
    ":all": [],
    ":common": []
};
