/***

MochiKit.Format 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Format');
}

if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}

if (typeof(MochiKit.Format) == 'undefined') {
    MochiKit.Format = {};
}

MochiKit.Format.NAME = "MochiKit.Format";
MochiKit.Format.VERSION = "0.80";
MochiKit.Format.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}
MochiKit.Format.toString = function () {
    return this.__repr__();
}

MochiKit.Format.twoDigitAverage = function (numerator, denominator) {
    /***

        Calculate an average from a numerator and a denominator and return
        it as a string with two digits of precision (e.g. "1.23").

        If the denominator is 0, "0" will be returned instead of NaN.

    ***/
    if (denominator) {
        var res = numerator / denominator;
        if (!isNaN(res)) {
            return MochiKit.Format.twoDigitFloat(numerator / denominator);
        }
    }
    return "0";
};

MochiKit.Format.twoDigitFloat = function (someFloat) {
    /***
    
        Roughly equivalent to: sprintf("%.2f", someFloat)

    ***/
    var sign = (someFloat < 0 ? '-' : '');
    var s = Math.floor(Math.abs(someFloat) * 100).toString();
    if (s == '0') {
        return s;
    }
    if (s.length < 3) {
        while (s.charAt(s.length - 1) == '0') {
            s = s.substring(0, s.length - 1);
        }
        return sign + '0.' + s;
    }
    var head = sign + s.substring(0, s.length - 2);
    var tail = s.substring(s.length - 2, s.length);
    if (tail == '00') {
        return head;
    } else if (tail.charAt(1) == '0') {
        return head + '.' + tail.charAt(0);
    } else {
        return head + '.' + tail;
    }
};

MochiKit.Format.lstrip = function (str, /* optional */chars) {
    if (!chars) {
        return str.replace(/^\s+/, "");
    } else {
        return str.replace(new RegExp("^[" + chars + "]+"), "");
    }
};

MochiKit.Format.rstrip = function (str, /* optional */chars) {
    if (!chars) {
        return str.replace(/\s+$/, "");
    } else {
        return str.replace(new RegExp("[" + chars + "]+$"), "");
    }
};

MochiKit.Format.strip = function (str, /* optional */chars) {
    var self = MochiKit.Format;
    return self.rstrip(self.lstrip(str, chars), chars);
};

MochiKit.Format.percentFormat = function (someFloat) {
    /***

        Roughly equivalent to: sprintf("%.2f%%", someFloat * 100)

    ***/
    return MochiKit.Format.twoDigitFloat(100 * someFloat) + '%';
};

MochiKit.Format.EXPORT = [
    "twoDigitAverage",
    "twoDigitFloat",
    "percentFormat",
    "lstrip",
    "rstrip",
    "strip"
];

MochiKit.Format.EXPORT_OK = [];
MochiKit.Format.EXPORT_TAGS = {
    ':all': MochiKit.Format.EXPORT,
    ':common': MochiKit.Format.EXPORT
};

MochiKit.Format.__new__ = function () {
    // MochiKit.Base.nameFunctions(this);
    var base = this.NAME + ".";
    for (var k in this) {
        var o = this[k];
        if (typeof(o) == 'function' && typeof(o.NAME) == 'undefined') {
            try {
                o.NAME = base + k;
            } catch (e) {
                // pass
            }
        }
    }
}

MochiKit.Format.__new__();

if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Format);
}
