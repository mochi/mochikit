function isoDate(str) {
    /***

        Convert an ISO 8601 date (YYYY-MM-DD) to a Date object.

    ***/
    var iso = str.split('-');
    return new Date(iso[0], iso[1] - 1, iso[2]);
}

function isoTimestamp(str) {
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
}

function toISOTime(date) {
    /***

        Get the hh:mm:ss from the given Date object.

    ***/
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var lst = [hh, ((mm < 10) ? "0" + mm : mm), ((ss < 10) ? "0" + ss : ss)];
    return lst.join(":");
}

function toISOTimestamp(date, realISO) {
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
}

function toISODate(date) {
    /***

        Convert a Date object to an ISO 8601 date string (YYYY-MM-DD)

    ***/
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
}

function americanDate(d) {
    /***

        Converts a MM/DD/YYYY date to a Date object

    ***/
    var a = d.split('/');
    return new Date(a[2], a[0] - 1, a[1]);
}

function _padTwo(n) {
    return (n > 9) ? n : "0" + n;
}

function toPaddedAmericanDate(d) {
    /***

        Converts a Date object to an MM/DD/YYYY date, e.g. 01/01/2001

    ***/
    return [_padTwo(d.getMonth() + 1), _padTwo(d.getDate()), d.getFullYear()].join('/');
}

function toAmericanDate(d) {
    /***

        Converts a Date object to an M/D/YYYY date, e.g. 1/1/2001

    ***/
    return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
}
