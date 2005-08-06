/***

MochiKit.DateTime 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.DateTime');
}

if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}
       
if (typeof(MochiKit.DateTime) == 'undefined') {
    MochiKit.DateTime = {};
}

MochiKit.DateTime.NAME = "MochiKit.DateTime";
MochiKit.DateTime.VERSION = "0.80";
MochiKit.DateTime.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}
MochiKit.DateTime.toString = function () {
    return this.__repr__();
}

MochiKit.DateTime.isoDate = function (str) {
    /***

        Convert an ISO 8601 date (YYYY-MM-DD) to a Date object.

    ***/
    var iso = str.split('-');
    return new Date(iso[0], iso[1] - 1, iso[2]);
};

MochiKit.DateTime.isoTimestamp = function (str) {
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

MochiKit.DateTime.toISOTime = function (date) {
    /***

        Get the hh:mm:ss from the given Date object.

    ***/
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var lst = [hh, ((mm < 10) ? "0" + mm : mm), ((ss < 10) ? "0" + ss : ss)];
    return lst.join(":");
};

MochiKit.DateTime.toISOTimestamp = function (date, realISO) {
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
    return MochiKit.DateTime.toISODate(date) + sep + MochiKit.DateTime.toISOTime(date);
};

MochiKit.DateTime.toISODate = function (date) {
    /***

        Convert a Date object to an ISO 8601 date string (YYYY-MM-DD)

    ***/
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
};

MochiKit.DateTime.americanDate = function (d) {
    /***

        Converts a MM/DD/YYYY date to a Date object

    ***/
    var a = d.split('/');
    return new Date(a[2], a[0] - 1, a[1]);
};

var _padTwo = function (n) {
    return (n > 9) ? n : "0" + n;
};

MochiKit.DateTime.toPaddedAmericanDate = function (d) {
    /***

        Converts a Date object to an MM/DD/YYYY date, e.g. 01/01/2001

    ***/
    return [
        _padTwo(d.getMonth() + 1),
        _padTwo(d.getDate()),
        d.getFullYear()
    ].join('/');
};

MochiKit.DateTime.toAmericanDate = function (d) {
    /***

        Converts a Date object to an M/D/YYYY date, e.g. 1/1/2001

    ***/
    return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
};

MochiKit.DateTime.EXPORT = [
    "isoDate",
    "isoTimestamp",
    "toISOTime",
    "toISOTimestamp",
    "toISODate",
    "americanDate",
    "toPaddedAmericanDate",
    "toAmericanDate"
];

MochiKit.DateTime.EXPORT_OK = [];
MochiKit.DateTime.EXPORT_TAGS = {
    ":common": MochiKit.DateTime.EXPORT,
    ":all": MochiKit.DateTime.EXPORT
}

MochiKit.DateTime.__new__ = function () {
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

MochiKit.DateTime.__new__();

if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.DateTime);
}
