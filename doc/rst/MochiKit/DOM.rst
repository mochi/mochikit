.. title:: MochiKit.DOM - painless DOM manipulation API

Name
====

MochiKit.DOM - painless DOM manipulation API


Synopsis
========

::

    var rows = [
        ["dataA1", "dataA2", "dataA3"],
        ["dataB1", "dataB2", "dataB3"]
    ];
    row_display = function (row) {
        return TR(null, map(partial(TD, null), row));
    }
    var newTable = TABLE({'class': 'prettytable'}
        THEAD(null,
            row_display(["head1", "head2", "head3"])),
        TFOOT(null,
            row_display(["foot1", "foot2", "foot3"])),
        TBODY(null,
            map(row_display, rows)));
    // put that in your document.createElement and smoke it!
    swapDOM(oldTable, newTable);


Description
===========

As you probably know, the DOM APIs are some of the most painful Java-inspired
APIs you'll run across from a highly dynamic language.  Don't worry about that
though, because they provide a reasonable basis to build something that
sucks a lot less.

MochiKit.DOM takes much of its inspiration from Nevow's [1]_ stan [2]_.
This means you choose a tag, give it some attributes, then stuff it full
of *whatever objects you want*.  MochiKit.DOM isn't stupid, it knows that
a string should be a text node, and that you want functions to be called,
and that ``Array``-like objects should be expanded, and stupid ``null`` values
should be skipped.

Hell, it will let you return strings from functions, and use iterators from
`MochiKit.Iter`_.  If that's not enough, just teach it new tricks with
``registerDOMConverter``.  If you have never used an API like this for
creating DOM elements, you've been wasting your damn time.  Get with it!
    
.. _`MochiKit.Iter`: Iter.html


Dependencies
============

- `MochiKit.Base`_
- `MochiKit.Iter`_

.. _`MochiKit.Base`: Base.html
.. _`MochiKit.Iter`: Iter.html


Overview
========

DOM Coercion Rules
------------------

In order of precedence, ``createDOM`` coerces given arguments to DOM
nodes using the following rules:

1.  Functions are called with a ``this`` of the parent
    node and their return value is subject to the
    following rules (even this one)
2.  ``undefined`` and ``null`` are ignored.
3.  Iterables (see `MochiKit.Iter`_) are flattened
    (as if they were passed in-line as nodes) and each
    return value is subject to all of these rules.
4.  Values that look like DOM nodes (objects with a
    ``.nodeType > 0``) are ``.appendChild``'ed to the created
    DOM fragment.
5.  Strings are wrapped up with ``document.createTextNode``
6.  Objects that are not strings are run through the ``domConverters``
    ``AdapterRegistry`` (see `MochiKit.Base`_ and ``registerDOMConverter``).
    The value returned by the adapter is subject to these same rules (e.g.
    adapters are allowed to return a string, which will be coerced into a
    text node).
7.  If no adapter is available, ``.toString()`` is used to create a text node.


Creating DOM Element Trees
--------------------------

``createDOM`` provides you with an excellent facility for creating DOM trees
that is easy on the wrists.  One of the best ways to understand how to use
it is to take a look at an example::

    var rows = [
        ["dataA1", "dataA2", "dataA3"],
        ["dataB1", "dataB2", "dataB3"]
    ];
    row_display = function (row) {
        return TR(null, map(partial(TD, null), row));
    }
    var newTable = TABLE({'class': 'prettytable'}
        THEAD(null,
            row_display(["head1", "head2", "head3"])),
        TFOOT(null,
            row_display(["foot1", "foot2", "foot3"])),
        TBODY(null,
            map(row_display, rows)));
        

This will create a table with the following visual layout (if it
were inserted into the document DOM):

    +--------+--------+--------+
    | head1  | head2  | head3  |
    +========+========+========+
    | dataA1 | dataA2 | dataA3 |
    +--------+--------+--------+
    | dataB1 | dataB2 | dataB3 |
    +--------+--------+--------+
    | foot1  | foot2  | foot3  |
    +--------+--------+--------+

Corresponding to the following HTML::

    <table>
        <thead>
            <tr>
                <td>head1</td>
                <td>head2</td>
                <td>head3</td>
            </tr>
        </thead>
        <tfoot>
            <tr>
                <td>foot1</td>
                <td>foot2</td>
                <td>foot3</td>
            </tr>
        </tfoot>
        <tbody>
            <tr>
                <td>dataA1</td>
                <td>dataA2</td>
                <td>dataA3</td>
            </tr>
            <tr>
                <td>dataB1</td>
                <td>dataB2</td>
                <td>dataB3</td>
            </tr>
        </tbody>
    </table>


Functions
---------

``registerDOMConverter(name, check, wrap[, override])``:

    Register an adapter to convert objects that match ``check(obj, ctx)``
    to a DOM element, or something that can be converted to a DOM
    element (i.e. number, bool, string, function, iterable).


``createDOM(name, [, attrs[, node[, ...]]])``:

    Create a DOM fragment in a really convenient manner, much like
    Nevow`s [1]_ stan [2]_.

    Partially applied versions of this function for common tags are
    available as aliases:

    - ``A``
    - ``DIV``
    - ``INPUT``
    - ``SPAN``
    - ``TABLE``
    - ``TBODY``
    - ``THEAD``
    - ``TFOOT``
    - ``TR``
    - ``TD``
    - ``TH``
    - ``UL``
    - ``OL``
    - ``LI``

    See `Creating DOM Element Trees`_ for a comprehensive example.

    ``name``:
        The kind of fragment to create (e.g. 'span').

    ``attrs``:
        An object whose properties will be used as the attributes
        (e.g. ``{'style': 'display:block'}``), or ``null`` if no
        attributes need to be set.

        Note that it will do the right thing for IE, so don't do
        the ``class`` -> ``className`` hack yourself.

    ``node``...:
        All additional arguments, if any, will be coerced into DOM
        nodes that are appended as children using the
        `DOM Coercion Rules`_.

    *returns*:
        A DOM element


``createDOMFunc(tag[, attrs[, node[, ...]]])``:
    
    Convenience function to create a partially applied createDOM
    function.  You'd want to use this if you add additional convenience
    functions for creating tags, or if you find yourself creating
    a lot of tags with a bunch of the same attributes or contents.

    See ``createDOM`` for more detailed descriptions of the arguments.

    ``tag``:
        The name of the tag

    ``attrs``:
        Optionally specify the attributes to apply

    ``node``...:
        Optionally specify any children nodes it should have

    *returns*:
        function that takes additional arguments and calls ``createDOM``


``swapDOM(dest, src)``:

    Replace ``dest`` in a DOM tree with ``src``, returning ``src``.

    ``dest``:
        a DOM element (or string id of one) to be replaced

    ``src``:
        the DOM element (or string id of one) to replace it with

    *returns*:
        a DOM element (``src``)


``getElement(id[, ...])``:

    A small quick little function to encapsulate the ``getElementById``
    method.  It includes a check to ensure we can use that method.

    If the id isn't a string, it will be returned as-is.

    Also available as ``$(...)`` for compatibility/convenience with other
    JavaScript frameworks.

    If multiple arguments are given, an ``Array`` will be returned.

``getElementsByTagAndClassName(tagName, className, parent=document)``:

    Returns an array of elements in ``parent`` that match the tag name
    and class name provided.
    
    If ``tagName`` is ``null`` or ``"*"``, all elements will be searched 
    for the matching class.
    
    If ``className`` is ``null``, all elements matching the provided tag are
    returned.

``$(id[, ...])``:

    An alias for ``getElement(id[, ...])``


``addLoadEvent(func)``:

    This will stack ``window.onload`` functions on top of each other.
    Each function added will be called after ``onload`` in the
    order that they were added.


``focusOnLoad(element)``:

    Add an onload event to focus the given element
       

``setElementClass(element, className)``:

    Set the entire class attribute of ``element`` to ``className``.
    ``element`` is looked up with ``getElement``, so string identifiers
    are also acceptable.
        

``toggleElementClass(className[, element[, ...]])``:

    Toggle the presence of a given ``className`` in the class attribute
    of all given elements.  All elements will be looked up with ``getElement``,
    so string identifiers are acceptable.


``addElementClass(element, className)``:

    Ensure that the given ``element`` has ``className`` set as part of its
    class attribute.  This will not disturb other class names.
    ``element`` is looked up with ``getElement``, so string identifiers
    are also acceptable.


``removeElementClass(element, className)``:

    Ensure that the given ``element`` does not have ``className`` set as part
    of its class attribute.  This will not disturb other class names.
    ``element`` is looked up with ``getElement``, so string identifiers
    are also acceptable.


``swapElementClass(element, fromClass, toClass)``:

    If ``fromClass`` is set on ``element``, replace it with ``toClass``.
    This will not disturb other classes on that element.
    ``element`` is looked up with ``getElement``, so string identifiers
    are also acceptable.


``hasElementClass(element, className[, ...])``:

    Return ``true`` if ``className`` is found on the ``element``.
    ``element`` is looked up with ``getElement``, so string identifiers
    are also acceptable.


``escapeHTML(s)``:

    Make a string safe for HTML, converting the usual suspects (lt,
    gt, quot, apos, amp)


``toHTML(dom)``:

    Convert a DOM tree to a HTML string using ``emitHTML``


``emitHTML(dom[, lst])``:

    Convert a DOM tree to an ``Array`` of HTML string fragments

    You probably want to use ``toHTML`` instead.


``setDisplayForElement(display, element[, ...])``:

    Change the ``style.display`` for the given element(s).  Usually
    used as the partial forms:

    - ``showElement(element, ...);``
    - ``hideElement(element, ...);``

    Elements are looked up with ``getElement``, so string identifiers are
    acceptable.


``showElement(element, ...)``:

    Partial form of ``setDisplayForElement``, specifically::

        partial(setDisplayForElement("block"))


``hideElement(element, ...);``

    Partial form of ``setDisplayForElement``, specifically::

        partial(setDisplayForElement("none"))


``scrapeText(node)``:

    Walk a DOM tree and scrape all of the text out of it as an ``Array``.
    Typically you will want to do get the string with:
    ``scrapeText(node).join('')``


``addToCallStack(target, path, func[, once])``:

    Set the property ``path`` of ``target`` to a function that calls the
    existing function at that property (if any), then calls ``func``.

    If ``target[path]()`` returns exactly ``false``, then ``func`` will
    not be called.

    If ``once`` is ``true``, then ``target[path]`` is set to ``null`` after
    the function call stack has completed.

    If called several times for the same ``target[path]``, it will create
    a stack of functions (instead of just a pair).


See Also
========

.. [1] Nevow, a web application construction kit for Python: http://nevow.com/
.. [2] nevow.stan is a domain specific language for Python 
       (read as "crazy getitem/call overloading abuse") that Donovan and I
       schemed up at PyCon 2003 at this super ninja Python/C++ programmer's
       (David Abrahams) hotel room.  Donovan later inflicted this upon the
       masses in Nevow.  Check out the Divmod project page for some
       examples: http://nevow.com/Nevow2004Tutorial.html


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
