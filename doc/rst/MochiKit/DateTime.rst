.. -*- mode: rst -*-

Name
====

MochiKit.DateTime - "what time is it anyway?"


Synopsis
========

::

   stringDate = toISOTimestamp(new Date());
   daeObject = isoTimestamp(stringDate);


Description
===========

Remote servers don't give you JavaScript Date objects, and they certainly
don't want them from you, so you need to deal with string representations
of dates and timestamps.  MochiKit.Date does that.


Dependencies
============

None.


API Reference
=============

Functions
---------

``isoDate(str)``:

    Convert an ISO 8601 date (YYYY-MM-DD) to a ``Date`` object.


``isoTimestamp(str)``:

    Convert a subset of ISO 8601 [1]_ timestamps (or something close to it)
    to a ``Date`` object.  Will accept the "de facto" form:

        YYYY-MM-DD hh:mm:ss

    or (the proper form):

        YYYY-MM-DDThh:mm:ss


``toISOTime(date)``:

    Get the hh:mm:ss from the given ``Date`` object as a string.


``toISOTimestamp(date, realISO)``:

    Convert a ``Date`` object to something that's ALMOST but not quite an
    ISO 8601 [1]_timestamp.  If it was a proper ISO timestamp it would be:

        YYYY-MM-DDThh:mm:ss

    However, we see junk in SQL and other places that looks like this:

        YYYY-MM-DD hh:mm:ss

    So, this function returns the latter form, despite its name, unless
    you pass ``true`` for ``realISO``.


``toISODate(date)``:

    Convert a ``Date`` object to an ISO 8601 [1]_ date string (YYYY-MM-DD)


``americanDate(d)``:

    Converts a MM/DD/YYYY date to a ``Date`` object


``toPaddedAmericanDate(d)``:

    Converts a ``Date`` object to an MM/DD/YYYY date, e.g. 01/01/2001


``toAmericanDate(d)``:

    Converts a ``Date`` object to an M/D/YYYY date, e.g. 1/1/2001


See Also
========

.. [1] W3C profile of ISO 8601: http://www.w3.org/TR/NOTE-datetime


Authors
=======

- Bob Ippolito <bob@redivi.com>


Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>.  This program is dual-licensed
free software; you can redistribute it and/or modify it under the terms of the
`MIT License`_ or the `Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
