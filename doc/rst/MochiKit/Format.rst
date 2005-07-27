.. title:: MochiKit.Format - string formatting goes here

Name
====

MochiKit.Format - string formatting goes here


Synopsis
========

::

   assert( twoDigitAverage(1, 0) == "0" );
   assert( twoDigitFloat(1.2345) == "1.23" );
   assert( twoDigitFloat(1) == "1" );
   assert( percentFormat(1.234567) == "123.45%" );

   assert( thisModuleNeedsMoreStuff );


Description
===========

Formatting strings and stringifying numbers is boring, so a couple useful
functions in that domain live here.  So far, there's not much to see here.


Dependencies
============

None.


API Reference
=============

Functions
---------

``twoDigitAverage(numerator, denominator)``:

    Calculate an average from a numerator and a denominator and return
    it as a string with two digits of precision (e.g. "1.23").

    If the denominator is 0, "0" will be returned instead of NaN.


``twoDigitFloat(someFloat)``:

    Roughly equivalent to: ``sprintf("%.2f", someFloat)``


``percentFormat(someFloat)``:

    Roughly equivalent to: ``sprintf("%.2f%%", someFloat * 100)``

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
