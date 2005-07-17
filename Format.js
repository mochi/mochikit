if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}

if (typeof(MochiKit.Format) == 'undefined') {
    MochiKit.Format = {};
}

MochiKit.Format.NAME = "MochiKit.Format";
MochiKit.Format.VERSION = "0.5";
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

MochiKit.Format.percentFormat = function (someFloat) {
    /***

        Roughly equivalent to: sprintf("%.2f%%", someFloat * 100)

    ***/
    return MochiKit.Format.twoDigitFloat(100 * someFloat) + '%';
};

MochiKit.Format.EXPORT = [
    "twoDigitAverage",
    "twoDigitFloat",
    "percentFormat"
];

MochiKit.Format.EXPORT_OK = [];
MochiKit.Format.EXPORT_TAGS = {
    ':all': MochiKit.Format.EXPORT,
    ':common': MochiKit.Format.EXPORT
};

if (typeof(JSAN) == 'undefined'
    || (typeof(__MochiKit_Compat__) == 'boolean' && __MochiKit_Compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Format);
}
