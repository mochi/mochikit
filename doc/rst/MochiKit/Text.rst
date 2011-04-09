.. title:: MochiKit.Text - string formatting and helper functions

Name
====

MochiKit.Text - string formatting and helper functions


Synopsis
========

::

   assert( startsWith("ab", "abcd") );
   assert( endsWith("cd", "abcd") );
   assert( contains("bc", "abcd") );
   assert( padLeft("abc", 5), "  abc" );
   assert( padRight("abc", 5, "*"), "abc**" );
   assert( truncate("abcd", 2) == "ab" );
   assert( formatValue("X", 31) == "1F" );
   assert( format("{0}: {1:.3f}", "value", 1.2345) == "value: 1.234" );
   assert( formatter("{:6.1%}")(0.125) == " 12.5%" );


Description
===========

MochiKit.Text provides helper functions for manipulating text (also
known as strings). A generic mechanism for formatting text and numbers
also live here.


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.Format` (to be removed)


Overview
========

Formatting Text
---------------

MochiKit provides a generic formatting facility, modeled after the
Python PEP 3101 Format Pattern Syntax [1]_. The text formatting
functions :mochiref:`formatter`, :mochiref:`format` and
:mochiref:`formatValue` support formatting both single and multiple
values for most practical uses. The same format pattern strings (or
part of it) is used by all three functions, and can contains an
arbitrary number of both positional and named values mixed into
plain text:

::

    The {0} and {1} positional values.
    Property values {name} and {value}.

The curly brace characters ``{`` and ``}`` are used to indicate a
replacement field inside the pattern. Braces can be escaped by
doubling, i.e. ``{{`` and ``}}``. Inside the braces, the format
pattern contains a value locator and a an optional formatting
specification, as such:

::

    locator[:specification]

The ``locator`` part specifies which value (function argument) to
format, either by position in the argument list or by accessing
properties in a value object. Both methods can be combined or deeply
nested, using a dot (``.``) to separate the sub-parts.

The ``specification`` part is optional and specifies which value
formatting to apply to the value.


Format Specifications
---------------------

The format specification outlines how a value is to be converted
into a text representation (a string). This is the only part of
the formatting pattern accepted by the :mochiref:`formatValue`
function. It consists of a number of parts:

::

    [flags][width][.precision][type]

All the parts are optional and have the following meaning:

* ``flags`` specifies the text alignment and numeric sign, padding and
  grouping flags. See the table below for available options.
* ``width`` a number specifying the minimum field width.
* ``precision`` a number indicating how many digits should be displayed
  after the decimal point in a floating point conversion. For a
  non-numeric ``type``, the field indicates the maximum field size.
* ``type`` indicates the desired formatting type to use. See the table
  below for available options.

For the ``flags`` and ``type`` fields, the available values are:

+---------+---------------------------------------------------------------+
| Symbol  |   Meaning                                                     |
+=========+===============================================================+
| ``>``   | Forces the field to be right-aligned if the ``width`` is      |
|         | larger than what is required by the formatted value. This is  |
|         | the default field alignment.                                  |
+---------+---------------------------------------------------------------+
| ``<``   | Forces the field to be left-aligned if the ``width`` is       |
|         | larger than what is required by the formatted value.          |
+---------+---------------------------------------------------------------+
| ``+``   | Any number format ``type`` will force a sign character for    |
|         | both positive and negative numbers.                           |
+---------+---------------------------------------------------------------+
| ``-``   | Any number format ``type`` will only use a sign character for |
|         | negative numbers. This is the default sign handling.          |
+---------+---------------------------------------------------------------+
| <blank> | Any number format ``type`` will use a space character as sign |
|         | on positive numbers, but a normal ``-`` for negative numbers. |
+---------+---------------------------------------------------------------+
| ``0``   | Any number format ``type`` will be zero-padded on the left    |
|         | side to match the field ``width``.                            |
+---------+---------------------------------------------------------------+
| ``,``   | Any number format ``type`` will use locale-specific grouping  |
|         | (thousand separators).                                        |
+---------+---------------------------------------------------------------+
| ``s``   | The default string format ``type``. The output from           |
|         | ``toString()`` will be used. This is the default format type. |
+---------+---------------------------------------------------------------+
| ``r``   | The programmers representation format ``type``. The output    |
|         | from :mochiref:`MochiKit.Base.repr()` will be used.           |
+---------+---------------------------------------------------------------+
| ``b``   | The binary number format ``type``. Rounds the number to the   |
|         | nearest integer and converts it to a base 2 representation.   |
+---------+---------------------------------------------------------------+
| ``d``   | The decimal or integer format ``type``. Rounds the number to  |
|         | the nearest integer.                                          |
+---------+---------------------------------------------------------------+
| ``o``   | The octal number format ``type``. Rounds the number to the    |
|         | nearest integer and converts it to a base 8 representation.   |
+---------+---------------------------------------------------------------+
| ``x``   | The hexadecimal number format ``type``. Rounds the number to  |
|         | the nearest integer and converts it to a base 16              |
|         | representation. Lower-case letters are used for digits a-f.   |
+---------+---------------------------------------------------------------+
| ``X``   | The hexadecimal number format ``type``. Rounds the number to  |
|         | the nearest integer and converts it to a base 16              |
|         | representation. Upper-case letters are used for digits A-F.   |
+---------+---------------------------------------------------------------+
| ``f``   | The fixed or floating point number format ``type``.           |
+---------+---------------------------------------------------------------+
| ``%``   | The percent floating point number format ``type``. The number |
|         | will be multiplied by 100 and a locale-specific ``%``         |
|         | character will be added to the end.                           |
+---------+---------------------------------------------------------------+



API Reference
=============

Errors
------

:mochidef:`FormatPatternError`:

    Thrown when a syntax error is encountered inside a format string
    by the :mochiref:`formatter`, :mochiref:`format` or
    :mochiref:`formatValue` functions. In addition to the normal
    :mochiref:`MochiKit.Base.NamedError` functions, each object also
    has the following properties set:

    ``pattern``:
        The invalid format pattern string.
    ``pos``:
        The position of the error in the format pattern (zero-indexed).
    ``message``:
        The detailed error message text.

    *Availability*:
        Available in MochiKit 1.5+

Functions
---------

:mochidef:`contains(substr, str)`:

    Returns ``true`` if ``str`` contains ``substr``, otherwise ``false``.
    If either ``str`` or ``substr`` is null, ``false`` is returned.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`endsWith(substr, str)`:

    Returns ``true`` if ``str`` ends with ``substr``, otherwise ``false``.
    If either ``str`` or ``substr`` is null, ``false`` is returned.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`format(pattern[, ...])`:

    Formats the values specified using a format ``pattern`` and
    returns the resulting string. The default locale is always used
    by this function. For more information see
    `Formatting Text`_.

    A :mochiref:`FormatPatternError` will be thrown if the formatting
    pattern is recognized as invalid.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`formatter(pattern, locale="default")`:

    Returns a function that formats values according to a format
    ``pattern``. The specified ``locale`` string or object will be
    used to adjust number formatting where appropriate. The
    returned function takes as many arguments as the format
    ``pattern`` requires. For more information see
    `Formatting Text`_.

    A :mochiref:`FormatPatternError` will be thrown if the formatting
    pattern is recognized as invalid.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`formatValue(spec, value, locale="default")`:

    Formats a ``value`` with the format specifier ``spec``. The
    specified ``locale`` string or object will be used to adjust
    number formatting where appropriate.
    
    Note that ``spec`` is only a partial formatting pattern, detailing
    only how a particular value is to be formatted. For more information
    see `Formatting Text`_.

    A :mochiref:`FormatPatternError` will be thrown if the partial
    formatting pattern is recognized as invalid.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`padLeft(str, minLength, fillChar=" ")`:

    Returns a string where ``fillChar`` has been prepended to ``str``
    until the string length is at least ``minLength`` characters.
    If ``str`` is undefined or null, the returned string will only
    consist of repeated ``fillChar`` copies.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`padRight(str, minLength, fillChar=" ")`:

    Returns a string where ``fillChar`` has been appended to ``str``
    until the string length is at least ``minLength`` characters.
    If ``str`` is undefined or null, the returned string will only
    consist of repeated ``fillChar`` copies.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`split(str, separator="\\n" [, max])`:

    Splits ``str`` using a ``separator`` string or regular expression. 
    If ``max`` is given, at most ``max`` splits will be performed
    (giving at most ``max`` + 1 parts returned).
    
    Returns an ``Array`` with the input ``str`` even if it was empty
    or no splits were made.

    If ``max`` is omitted, this is equivalent to the built in
    ``str.split(separator)``. The difference to the built in method
    can be illustrated by:

    ::

        >>> "lovely bunch of coconuts".split(" ", 2)
        ["lovely", "bunch"]

        >>> MochiKit.Text.split("lovely bunch of coconuts", " ", 2)
        ["lovely", "bunch", "of coconuts"]

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`rsplit(str, separator="\\n" [, max])`:

    Splits ``str`` using a ``separator`` string or regular expression. 
    This is similar to ``split``, except that if ``max`` is given,
    splits are performed from the right hand side first.

    ::

        >>> MochiKit.Text.rsplit("lovely bunch of coconuts", " ", 2)
        ["lovely bunch", "of", "coconuts"]

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`startsWith(substr, str)`:

    Returns ``true`` if ``str`` starts with ``substr``, otherwise ``false``.
    If either ``str`` or ``substr`` is null, ``false`` is returned.

    *Availability*:
        Available in MochiKit 1.5+


:mochidef:`truncate(str, maxLength, tail="")`:

    Returns a truncated copy of ``str`` with no more than ``maxLength``
    characters. If ``str`` is truncated, ``tail`` will be appended  in
    the result string. Additional characters may be removed to make
    sure that the result has no more than ``maxLength`` characters.

    This function also works on Array objects, in which case ``tail``
    must also be an Array.

    *Availability*:
        Available in MochiKit 1.5+


See Also
========

.. [1] Python PEP 3101 Format Pattern Syntax:
       http://www.python.org/dev/peps/pep-3101/
.. [2] Python String Module:
       http://docs.python.org/library/string.html

Authors
=======

- Per Cederberg <cederberg@gmail.com>


Copyright
=========

Copyright 2005-2009 by Bob Ippolito <bob@redivi.com> and Per Cederberg
<cederberg@gmail.com>. This program is dual-licensed free software; you can
redistribute it and/or modify it under the terms of the `MIT License`_ or the
`Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
