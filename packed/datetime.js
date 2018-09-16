/**
 * @license
 * MochiKit <https://mochi.github.io/mochikit> 
 * Making JavaScript better and easier with a consistent, clean API.
 * Built at "Sun Sep 16 2018 11:45:19 GMT+0100 (British Summer Time)".
 * Command line options: "MochiKit async base color data datetime dom func iter logging repr"
 */
this.mochikit = this.mochikit || {};
this.mochikit.datetime = (function (exports) {
    'use strict';

    function americanDate(d) {
        d = d + "";
        if (typeof(d) !== "string" || d.length === 0) {
            return null;
        }
        var a = d.split('/');
        return new Date(a[2], a[0] - 1, a[1]);
    }

    function isoDate(str) {
        str = str + "";
        if (typeof(str) != "string" || str.length === 0) {
            return null;
        }
        var iso = str.split('-');
        if (iso.length === 0) {
            return null;
        }
        var date = new Date(parseInt(iso[0], 10), parseInt(iso[1], 10) - 1, parseInt(iso[2], 10));
        date.setFullYear(iso[0]);
        date.setMonth(iso[1] - 1);
        date.setDate(iso[2]);
        return date;
    }

    //This is a big boy...
    //TODO: trim this down
    const re = /(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/;

    //can someone fix that horrible isoTimestamp function?
    //Not gonna include it until it looks clean and understandable.
    function isoTimestamp () {}
    // export default function isoTimestamp(str) {
    //     str = str + "";
    //     if (typeof(str) != "string" || str.length === 0) {
    //         return null;
    //     }
    //     var res = str.match(MochiKit.DateTime._isoRegexp);
    //     if (typeof(res) == "undefined" || res === null) {
    //         return null;
    //     }
    //     var year, month, day, hour, min, sec, msec;
    //     year = parseInt(res[1], 10);
    //     if (typeof(res[2]) == "undefined" || res[2] === '') {
    //         return new Date(year);
    //     }
    //     month = parseInt(res[2], 10) - 1;
    //     day = parseInt(res[3], 10);
    //     if (typeof(res[4]) == "undefined" || res[4] === '') {
    //         return new Date(year, month, day);
    //     }
    //     hour = parseInt(res[4], 10);
    //     min = parseInt(res[5], 10);
    //     sec = (typeof(res[6]) != "undefined" && res[6] !== '') ? parseInt(res[6], 10) : 0;
    //     if (typeof(res[7]) != "undefined" && res[7] !== '') {
    //         msec = Math.round(1000.0 * parseFloat("0." + res[7]));
    //     } else {
    //         msec = 0;
    //     }
    //     if ((typeof(res[8]) == "undefined" || res[8] === '') && (typeof(res[9]) == "undefined" || res[9] === '')) {
    //         return new Date(year, month, day, hour, min, sec, msec);
    //     }
    //     var ofs;
    //     if (typeof(res[9]) != "undefined" && res[9] !== '') {
    //         ofs = parseInt(res[10], 10) * 3600000;
    //         if (typeof(res[11]) != "undefined" && res[11] !== '') {
    //             ofs += parseInt(res[11], 10) * 60000;
    //         }
    //         if (res[9] == "-") {
    //             ofs = -ofs;
    //         }
    //     } else {
    //         ofs = 0;
    //     }
    //     return new Date(Date.UTC(year, month, day, hour, min, sec, msec) - ofs);
    // };

    function padFour(n) {
        switch(n.toString().length) {
            case 1: return "000" + n;
            case 2: return "00" + n;
            case 3: return "0" + n;
            default: return n;
        }
    }

    function padTwo(n) {
        return (n > 9) ? n : "0" + n;
    }

    function toAmericanDate(d) {
        if (typeof(d) == "undefined" || d === null) {
            return null;
        }
        return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
    }

    function toISODate(date) {
        if (typeof(date) == "undefined" || date === null) {
            return null;
        }
        return [
            padFour(date.getFullYear()),
            padTwo(date.getMonth() + 1),
            padTwo(date.getDate())
        ].join("-");
    }

    function toISOTime(date, realISO/* = false */) {
        if (date == null) {
            return null;
        }
        if (realISO) {
            // adjust date for UTC timezone
            date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        }
        var lst = [
            (realISO ? padTwo(date.getHours()) : date.getHours()),
            padTwo(date.getMinutes()),
            padTwo(date.getSeconds())
        ];
        return lst.join(":") + (realISO ? "Z" : "");
    }

    function toISOTimestamp(date, realISO/* = false*/) {
        if (date == null) {
            return null;
        }

        var time = toISOTime(date, realISO);
        var sep = realISO ? "T" : " ";
        if (realISO) {
            // adjust date for UTC timezone
            date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        }
        return toISODate(date) + sep + time;
    }

    function toPaddedAmericanDate(d) {
        if (d == null) {
            return null;
        }

        return [
            padTwo(d.getMonth() + 1),
            padTwo(d.getDate()),
            d.getFullYear()
        ].join('/');
    }

    const __repr__ = '[MochiKit.DateTime]';

    exports.__repr__ = __repr__;
    exports.americanDate = americanDate;
    exports.isoDate = isoDate;
    exports.isoRegExp = re;
    exports.isoTimestamp = isoTimestamp;
    exports.padFour = padFour;
    exports.padTwo = padTwo;
    exports.toAmericanDate = toAmericanDate;
    exports.toISODate = toISODate;
    exports.toISOTime = toISOTime;
    exports.toISOTimestamp = toISOTimestamp;
    exports.toPaddedAmericanDate = toPaddedAmericanDate;

    return exports;

}({}));
