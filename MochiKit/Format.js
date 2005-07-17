if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base");
}

try {
    if (typeof(MochiKit.Base) == 'undefined') {
        throw "";
    }
} catch (e) {
    // well, not for anything but EXPORT_TAGS use of concat(...),
    // but I'm going to pretend.
    throw "MochiKit.Format depends on MochiKit.Base!";
}

if (typeof(MochiKit.Format) == 'undefined') {
    MochiKit.Format = {};
}

MochiKit.Format.NAME = "MochiKit.Format";
MochiKit.Format.VERSION = "0.5";
MochiKit.Format.toString = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}

MochiKit.Format.__new__ = function () {

    var twoDigitAverage = function (numerator, denominator) {
        /***

            Calculate an average from a numerator and a denominator and return
            it as a string with two digits of precision (e.g. "1.23").

            If the denominator is 0, "0" will be returned instead of NaN.

        ***/
        if (denominator) {
            var res = numerator / denominator;
            if (!isNaN(res)) {
                return twoDigitFloat(numerator / denominator);
            }
        }
        return "0";
    };

    var twoDigitFloat = function (someFloat) {
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

    var percentFormat = function (someFloat) {
        /***

            Roughly equivalent to: sprintf("%.2f%%", someFloat * 100)

        ***/
        return twoDigitFloat(100 * someFloat) + '%';
    };

    var NAMES = [
        ["twoDigitAverage", twoDigitAverage],
        ["twoDigitFloat", twoDigitFloat],
        ["percentFormat", percentFormat]
    ];

    var EXPORT = [];
    for (var i = 0; i < NAMES.length; i++) {
        var o = NAMES[i];
        this[o[0]] = o[1];
        EXPORT.push(o[0]);
    }

    this.EXPORT = EXPORT;
    this.EXPORT_OK = [];
    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": concat(this.EXPORT, this.EXPORT_OK)
    };

};

MochiKit.Format.__new__();

if (typeof(JSAN) == 'undefined'
    || (typeof(__MochiKit_Compat__) == 'boolean' && __MochiKit_Compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Format);
}
