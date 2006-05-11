.. title:: MochiKit.Style - painless Style manipulation API

Name
====

MochiKit.Style - painless Style manipulation API


Synopsis
========

::
    
    var messagePos = getElementPosition('message');
    var messageSize = getElementDimensions('message');
    
    var notifyPos = new MochiKit.Style.Coordinates(
         messagePos.x + messageSize.x + 10,
         messagePos.y);

    setElementPosition('notify', notifyPos);
    

Description
===========

Refactored from :mochiref:`MochiKit.DOM`.


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.DOM`


Overview
========

Refactored from :mochiref:`MochiKit.DOM`.


Element Visibility
------------------

The :mochiref:`hideElement` and :mochiref:`showElement` functions are
provided as a convenience, but only work for elements that are
``display: block``. For a general solution to showing, hiding, and checking
the explicit visibility of elements, we recommend using a solution that
involves a little CSS. Here's an example::

    <style type="text/css">
        .invisible { display: none; }
    </style>

    <script type="text/javascript">
        function toggleVisible(elem) {
            toggleElementClass("invisible", elem); 
        }

        function makeVisible(elem) {
            removeElementClass(elem, "invisible");
        }

        function makeInvisible(elem) {
            addElementClass(elem, "invisible");
        }

        function isVisible(elem) {
            // you may also want to check for
            // getElement(elem).style.display == "none"
            return !hasElementClass(elem, "invisible");
        }; 
    </script>

MochiKit doesn't ship with such a solution, because there is no reliable and
portable method for adding CSS rules on the fly with JavaScript.


API Reference
=============

Functions
---------

:mochidef:`computedStyle(htmlElement, cssProperty, mozillaEquivalentCSS)`:

    Looks up a CSS property for the given element. The element can be
    specified as either a string with the element's ID or the element
    object itself.


:mochidef:`setOpacity(element, opacity)`:

    Sets ``opacity`` for ``element``. Valid ``opacity`` values range from 0
    (invisible) to 1 (opaque). ``element`` is looked up with
    :mochiref:`getElement`, so string identifiers are also acceptable.


:mochidef:`getElementDimensions(element)`:

    Return the absolute pixel width and height of ``element`` as an object with
    ``w`` and ``h`` properties, or ``undefined`` if ``element`` is not in the
    document. ``element`` may be specified as a string to be looked up with
    :mochiref:`getElement`, a DOM element, or trivially as an object with
    ``w`` and/or ``h`` properties.


:mochidef:`setElementDimensions(element, dimensions[, units='px'])`:

    Sets the dimensions of ``element`` in the document from an
    object with ``w`` and ``h`` properties.
    
    ``node``:
        A reference to the DOM element to update (if a string is given,
        :mochiref:`getElement(node)` will be used to locate the node)
        
    ``dimensions``:
        An object with ``w`` and ``h`` properties
        
    ``units``:
        Optionally set the units to use, default is ``px``


:mochidef:`getElementPosition(element[, relativeTo={x: 0, y: 0}])`:

    Return the absolute pixel position of ``element`` in the document as an
    object with ``x`` and ``y`` properties, or ``undefined`` if ``element``
    is not in the document. ``element`` may be specified as a string to
    be looked up with :mochiref:`getElement`, a DOM element, or trivially
    as an object with ``x`` and/or ``y`` properties.

    If ``relativeTo`` is given, then its coordinates are subtracted from
    the absolute position of ``element``, e.g.::

        var elemPos = elementPosition(elem);
        var anotherElemPos = elementPosition(anotherElem);
        var relPos = elementPosition(elem, anotherElem);
        assert( relPos.x == (elemPos.x - anotherElemPos.x) );
        assert( relPos.y == (elemPos.y - anotherElemPos.y) );

    ``relativeTo`` may be specified as a string to be looked up with
    :mochiref:`getElement`, a DOM element, or trivially as an object
    with ``x`` and/or ``y`` properties.


:mochidef:`setElementPosition(element, position[, units='px'])`:

    Sets the absolute position of ``element`` in the document from an
    object with ``x`` and ``y`` properties.
    
    ``node``:
        A reference to the DOM element to update (if a string is given,
        :mochiref:`getElement(node)` will be used to locate the node)
        
    ``position``:
        An object with ``x`` and ``y`` properties
        
    ``units``:
        Optionally set the units to use, default is ``px``


:mochidef:`setDisplayForElement(display, element[, ...])`:

    Change the ``style.display`` for the given element(s). Usually
    used as the partial forms:

    - :mochiref:`showElement(element, ...)`
    - :mochiref:`hideElement(element, ...)`

    Elements are looked up with :mochiref:`getElement`, so string identifiers
    are acceptable.

    For information about the caveats of using a ``style.display`` based
    show/hide mechanism, and a CSS based alternative, see
    `Element Visibility`_.
    

:mochidef:`showElement(element, ...)`:

    Partial form of :mochiref:`setDisplayForElement`, specifically::

        partial(setDisplayForElement, "block")

    For information about the caveats of using a ``style.display`` based
    show/hide mechanism, and a CSS based alternative, see
    `Element Visibility`_.


:mochidef:`hideElement(element, ...)`:

    Partial form of :mochiref:`setDisplayForElement`, specifically::

        partial(setDisplayForElement, "none")

    For information about the caveats of using a ``style.display`` based
    show/hide mechanism, and a CSS based alternative, see
    `Element Visibility`_.


Authors
=======

- Bob Ippolito <bob@redivi.com>
- Beau Hartshorne <beau@hartshornesoftware.com>


Copyright
=========

Copyright 2005-2006 Bob Ippolito <bob@redivi.com>, and Beau Hartshorne. This
program is dual-licensed free software; you can redistribute it and/or modify
it under the terms of the `MIT License`_ or the `Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
