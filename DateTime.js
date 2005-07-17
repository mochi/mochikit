if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base");
}

try {
    if (typeof(MochiKit.Base) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.DateTime depends on MochiKit.Base!";
}
        
if (typeof(MochiKit.DateTime) == 'undefined') {
    MochiKit.DateTime = {};
}

MochiKit.DateTime.__new__ = function () {
    var isoDate = function (str) {
        /***

            Convert an ISO 8601 date (YYYY-MM-DD) to a Date object.

        ***/
        var iso = str.split('-');
        return new Date(iso[0], iso[1] - 1, iso[2]);
    };

    var isoTimestamp = function (str) {
        /***

            Convert an ISO 8601 timestamp (or something close to it) to
            a Date object.  Will accept the "de facto" form:

                YYYY-MM-DD hh:mm:ss

            or (the proper form):

                YYYY-MM-DDThh:mm:ss

        ***/
        var tmp = str.split(' ');
        if (tmp.length == 1) {
            tmp = str.split('T');
        }
        var iso = tmp[0].split('-');
        var t = tmp[1].split(':');
        return new Date(iso[0], iso[1] - 1, iso[2], t[0], t[1], t[2]);
    };

    var toISOTime = function (date) {
        /***

            Get the hh:mm:ss from the given Date object.

        ***/
        var hh = date.getHours();
        var mm = date.getMinutes();
        var ss = date.getSeconds();
        var lst = [hh, ((mm < 10) ? "0" + mm : mm), ((ss < 10) ? "0" + ss : ss)];
        return lst.join(":");
    };

    var toISOTimestamp = function (date, realISO) {
        /***

            Convert a Date object to something that's ALMOST but not quite an
            ISO 8601 timestamp.  If it was a proper ISO timestamp it would be:

                YYYY-MM-DDThh:mm:ss

            However, we see junk in SQL and other places that looks like this:

                YYYY-MM-DD hh:mm:ss

            So, this function returns the latter form, despite its name, unless
            you pass true for realISO.

        ***/
        var sep = realISO ? "T" : " ";
        return toISODate(date) + sep + toISOTime(date);
    };

    var toISODate = function (date) {
        /***

            Convert a Date object to an ISO 8601 date string (YYYY-MM-DD)

        ***/
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
    };

    var americanDate = function (d) {
        /***

            Converts a MM/DD/YYYY date to a Date object

        ***/
        var a = d.split('/');
        return new Date(a[2], a[0] - 1, a[1]);
    };

    var _padTwo = function (n) {
        return (n > 9) ? n : "0" + n;
    };

    var toPaddedAmericanDate = function (d) {
        /***

            Converts a Date object to an MM/DD/YYYY date, e.g. 01/01/2001

        ***/
        return [
            _padTwo(d.getMonth() + 1),
            _padTwo(d.getDate()),
            d.getFullYear()
        ].join('/');
    };

    var toAmericanDate = function (d) {
        /***

            Converts a Date object to an M/D/YYYY date, e.g. 1/1/2001

        ***/
        return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
    };

    var NAMES = [
        ["isoDate", isoDate],
        ["isoTimestamp", isoTimestamp],
        ["toISOTime", toISOTime],
        ["toISOTimestamp", toISOTimestamp],
        ["toISODate", toISODate],
        ["americanDate", americanDate],
        ["toPaddedAmericanDate", toPaddedAmericanDate],
        ["toAmericanDate", toAmericanDate]
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
    }
};

MochiKit.DateTime.__new__();

if (typeof(JSAN) == 'undefined'
    || (typeof(__MochiKit_Compat__) == 'boolean' && __MochiKit_Compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.DateTime);
}
