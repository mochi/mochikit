.. -*- mode: rst -*-

MochiKit.DateTime
=================

Functions
---------

isoDate(str):
    Convert an ISO 8601 date (YYYY-MM-DD) to a Date object.

isoTimestamp(str):
    Convert an ISO 8601 timestamp (or something close to it) to
    a Date object.  Will accept the "de facto" form:

        YYYY-MM-DD hh:mm:ss

    or (the proper form):

        YYYY-MM-DDThh:mm:ss

toISOTime(date):
    Get the hh:mm:ss from the given Date object.

toISOTimestamp(date, realISO):
    Convert a Date object to something that's ALMOST but not quite an
    ISO 8601 timestamp.  If it was a proper ISO timestamp it would be:

        YYYY-MM-DDThh:mm:ss

    However, we see junk in SQL and other places that looks like this:

        YYYY-MM-DD hh:mm:ss

    So, this function returns the latter form, despite its name, unless
    you pass true for realISO.

toISODate(date):
    Convert a Date object to an ISO 8601 date string (YYYY-MM-DD)

americanDate(d):
    Converts a MM/DD/YYYY date to a Date object

toPaddedAmericanDate(d):
    Converts a Date object to an MM/DD/YYYY date, e.g. 01/01/2001

toAmericanDate(d):
    Converts a Date object to an M/D/YYYY date, e.g. 1/1/2001
