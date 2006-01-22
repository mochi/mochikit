/***

MochiKit.DateTime 1.2

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
MochiKit.DateTime.VERSION = "1.2";
MochiKit.DateTime.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};
MochiKit.DateTime.toString = function () {
    return this.__repr__();
};

MochiKit.DateTime.isoDate = function (str) {
    /***

        Convert an ISO 8601 date (YYYY-MM-DD) to a Date object.

    ***/
    str = str + "";
    if (typeof(str) != "string" || str.length == 0) {
        return null;
    }
    var iso = str.split('-');
    if (iso.length == 0) {
        return null;
    }
    return new Date(iso[0], iso[1] - 1, iso[2]);
};

MochiKit.DateTime._isoRegexp = /(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/;

MochiKit.DateTime.isoTimestamp = function (str) {
    /***

        Convert an ISO 8601 timestamp (or something close to it) to
        a Date object.  Will accept the "de facto" form:

            YYYY-MM-DD hh:mm:ss

        or (the proper form):

            YYYY-MM-DDThh:mm:ss

    ***/
    str = str + "";
    if (typeof(str) != "string" || str.length == 0) {
        return null;
    }
    var res = str.match(MochiKit.DateTime._isoRegexp);
    if (typeof(res) == "undefined" || res == null) {
        return null;
    }
    var year, month, day, hour, min, sec, msec;
    year = parseInt(res[1], 10);
    if (typeof(res[2]) == "undefined" || res[2] == "") {
        return new Date(year);
    }
    month = parseInt(res[2], 10) - 1;
    day = parseInt(res[3], 10);
    if (typeof(res[4]) == "undefined" || res[4] == "") {
        return new Date(year, month, day);
    }
    hour = parseInt(res[4], 10);
    min = parseInt(res[5], 10);
    sec = (typeof(res[6]) != "undefined" && res[6] != "") ? parseInt(res[6], 10) : 0;
    if (typeof(res[7]) != "undefined" && res[7] != "") {
        msec = Math.round(1000.0 * parseFloat("0." + res[7]));
    } else {
        msec = 0;
    }
    if ((typeof(res[8]) == "undefined" || res[8] == "") && (typeof(res[9]) == "undefined" || res[9] == "")) {
        return new Date(year, month, day, hour, min, sec, msec);
    }
    var ofs;
    if (typeof(res[9]) != "undefined" && res[9] != "") {
        ofs = parseInt(res[10], 10) * 3600000;
        if (typeof(res[11]) != "undefined" && res[11] != "") {
            ofs += parseInt(res[11], 10) * 60000;
        }
        if (res[9] == "-") {
            ofs = -ofs;
        }
    } else {
        ofs = 0;
    }
    return new Date(Date.UTC(year, month, day, hour, min, sec, msec) - ofs);
};

MochiKit.DateTime.toISOTime = function (date, realISO/* = false */) {
    /***

        Get the hh:mm:ss from the given Date object.

    ***/
    if (typeof(date) == "undefined" || date == null) {
        return null;
    }
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var lst = [
        ((realISO && (hh < 10)) ? "0" + hh : hh),
        ((mm < 10) ? "0" + mm : mm),
        ((ss < 10) ? "0" + ss : ss)
    ];
    return lst.join(":");
};

MochiKit.DateTime.toISOTimestamp = function (date, realISO/* = false*/) {
    /***

        Convert a Date object to something that's ALMOST but not quite an
        ISO 8601 timestamp.  If it was a proper ISO timestamp it would be:

            YYYY-MM-DDThh:mm:ssZ

        However, we see junk in SQL and other places that looks like this:

            YYYY-MM-DD hh:mm:ss

        So, this function returns the latter form, despite its name, unless
        you pass true for realISO.

    ***/
    if (typeof(date) == "undefined" || date == null) {
        return null;
    }
    var sep = realISO ? "T" : " ";
    var foot = realISO ? "Z" : "";
    if (realISO) {
        date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    }
    return MochiKit.DateTime.toISODate(date) + sep + MochiKit.DateTime.toISOTime(date, realISO) + foot;
};

MochiKit.DateTime.toISODate = function (date) {
    /***

        Convert a Date object to an ISO 8601 date string (YYYY-MM-DD)

    ***/
    if (typeof(date) == "undefined" || date == null) {
        return null;
    }
    var _padTwo = MochiKit.DateTime._padTwo;
    return [
        date.getFullYear(),
        _padTwo(date.getMonth() + 1),
        _padTwo(date.getDate())
    ].join("-");
};

MochiKit.DateTime.americanDate = function (d) {
    /***

        Converts a MM/DD/YYYY date to a Date object

    ***/
    d = d + "";
    if (typeof(d) != "string" || d.length == 0) {
        return null;
    }
    var a = d.split('/');
    return new Date(a[2], a[0] - 1, a[1]);
};

MochiKit.DateTime._padTwo = function (n) {
    return (n > 9) ? n : "0" + n;
};

MochiKit.DateTime.toPaddedAmericanDate = function (d) {
    /***

        Converts a Date object to an MM/DD/YYYY date, e.g. 01/01/2001

    ***/
    if (typeof(d) == "undefined" || d == null) {
        return null;
    }
    var _padTwo = MochiKit.DateTime._padTwo;
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
    if (typeof(d) == "undefined" || d == null) {
        return null;
    }
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
};

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
};

MochiKit.DateTime.__new__();

if (typeof(MochiKit.Base) != "undefined") {
    MochiKit.Base._exportSymbols(this, MochiKit.DateTime);
} else {
    (function (globals, module) {
        if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
            || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
            var all = module.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                globals[all[i]] = module[all[i]]; 
            }
        }   
    })(this, MochiKit.DateTime);  
}
