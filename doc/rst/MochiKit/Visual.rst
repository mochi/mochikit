.. -*- mode: rst -*-

Name
====

MochiKit.Visual - visual effects


Synopsis
========

::

    // round the corners of all h1 elements
    roundClass("h1", null);
    
    // round the top left corner of the element with the id "title"
    new RoundCorner("title", {corners: "tl"});
    

Description
===========

MochiKit.Visual provides visual effects and support functions for visuals.

Dependencies
============

- `MochiKit.Base`_
- `MochiKit.Iter`_
- `MochiKit.DOM`_

.. _`MochiKit.Base`: Base.html
.. _`MochiKit.DOM`: DOM.html
.. _`MochiKit.Iter`: Iter.html


Overview
========

At this time, MochiKit.Visual provides one visual effect: rounded corners
for your HTML elements. These rounded corners are created completely
through CSS manipulations and require no external images or style sheets.
This implementation was adapted from Rico_.

.. _Rico: http://www.openrico.org

The Visual package also includes some functions for computing colors and a
``Color`` object that provides some useful methods for working with colors.


API Reference
=============

Constructors
------------

``Color(red, green, blue)``:

    Represents a color.  Component values should be integers between ``0``
    and ``255``.  It is recommended that you use one of the ``Color`` factory
    functions such as ``Color.fromRGB``, ``Color.fromHSB``, etc. instead
    of constructing ``Color`` objects directly.

    ``Color`` instances can be compared with ``MochiKit.Base.compare``
    (though ordering is on RGB, so is not particularly meaningful),
    and the default ``toString`` implementation returns
    ``this.toHexString()``.

    Alternate form:
        ``Color({r: red, g: green, b: blue})``.


``Color.fromRGB(red, green, blue)``:

    Return a ``Color`` object from the given ``red``, ``green``, ``blue``
    values.  Values should be integers between ``0`` and ``255``.

    Alternate form:
        ``Color.fromRGB({r: red, g: green, b: blue})``


``Color.fromHSB(hue, saturation, brightness)``:

    Return a ``Color`` object from the given ``hue``, ``saturation``,
    ``brightness`` values.  Values should be numbers between ``0.0`` and
    ``1.0``.

    Alternate form:
        ``Color.fromHSB({h: hue, s: saturation, b: brightness})``


``Color.fromHexString(hexString)``:

    Returns a ``Color`` object from the given hexadecimal color string.
    For example, ``"#FFFFFF"`` would return a ``Color`` with
    RGB values ``[255, 255, 255]`` (white).


``Color.fromRGBString(rgbString)``:

    Returns a ``Color`` object from the given decimal rgb color string.
    For example, ``"rgb(255,255,255)"`` would return a ``Color`` with
    RGB values ``[255, 255, 255]`` (white).


``Color.fromString(rgbOrHexString)``:

    Returns a ``Color`` object from the given RGB or hex string, or ``null``
    if the string is not appropriate for either method.

    See ``Color.fromHexString`` and ``Color.fromRGBString`` for 
    more information.
    

``Color.fromBackground(elem)``:

    Returns a ``Color`` object based on the background of the provided
    element.
    

``Color.prototype.colorWithHue(hue)``:

    Return a new ``Color`` based on this color, but with the provided
    ``hue`` value.


``Color.prototype.colorWithSaturation(saturation)``:

    Return a new ``Color`` based on this color, but with the provided
    ``saturation`` value.


``Color.prototype.colorWithBrightness(brightness)``:

    Return a new ``Color`` based on this color, but with the provided
    ``brightness`` value.


``Color.prototype.darkerColorWithLevel(level)``:

    Return a new ``Color`` based on this color, but darker by the given
    ``level`` (between ``0`` and ``1.0``).


``Color.prototype.brighterColorWithLevel(level)``:

    Return a new ``Color`` based on this color, but brighter by the given
    ``level`` (between ``0`` and ``1.0``).


``Color.prototype.blendedColor(other, fraction=0.5)``:

    Return a new ``Color`` whose RGB component values are a weighted sum
    of this color and ``other``.  Each component of the returned color
    is the ``fraction`` of other's value plus ``1 - fraction`` of this
    color's.


``Color.prototype.isBright()``:

    Return ``true`` if the brightness value of this color is greater than
    ``0.5``.


``Color.prototype.isDark()``:

    Return ``true`` if the brightness value of this color is less than or
    equal to ``0.5``.


``Color.prototype.toRGBString()``:

    Return the decimal "rgb(red, green, blue)" string representation of this
    color.


``Color.prototype.toHexString()``:

    Return the hexadecimal "#RRGGBB" string representation of this color.


``Color.prototype.asRGB()``:

    Return the RGB (red, green, blue) components of this color as an object
    with ``r``, ``g``, and ``b`` properties, with integer values between
    ``0`` and ``255``.

    For example::

        assert( Color.whiteColor().toHexString() == "#FFFFFF" );


``Color.prototype.asHSB()``:

    Return the HSB (hue, saturation, brightness) components of this color
    as an object with ``h``, ``s``, and ``b`` properties, with floating
    point values between ``0.0`` and ``1.0``.


``Color.blackColor()``:

    Return a ``Color`` object whose RGB values are 0, 0, 0.


``Color.blueColor()``:
    
    Return a ``Color`` object whose RGB values are 0, 0, 255.


``Color.brownColor()``:

    Return a ``Color`` object whose RGB values are 153, 102, 51.


``Color.cyanColor()``:

    Return a ``Color`` object whose RGB values are 0, 255, 255.


``Color.darkGrayColor()``:

    Return a ``Color`` object whose RGB values are 85, 85, 85.


``Color.grayColor()``:

    Return a ``Color`` object whose RGB values are 127, 127, 127.


``Color.greenColor()``:

    Return a ``Color`` object whose RGB values are 0, 255, 0.


``Color.lightGrayColor()``:

    Return a ``Color`` object whose RGB values are 170, 170, 170.


``Color.magentaColor()``:

    Return a ``Color`` object whose RGB values are 255, 0, 255.


``Color.orangeColor()``:

    Return a ``Color`` object whose RGB values are 255, 127, 0.


``Color.purpleColor()``:

    Return a ``Color`` object whose RGB values are 127, 0, 127.


``Color.redColor()``:

    Return a ``Color`` object whose RGB values are 255, 0, 0.


``Color.whiteColor()``:

    Return a ``Color`` object whose RGB values are 255, 255, 255.


``Color.yellowColor()``:

    Return a ``Color`` object whose RGB values are 255, 255, 0.


``RoundCorners(element, options)``:

    When instantiated, this will immediately round the corners of the
    specified element. The element can be given as either a string 
    with the element ID, or as an element object.
    
    The options mapping has the following defaults:

    ========= =============
    corners   "all",
    color     "fromElement"
    bgColor   "fromParent"
    blend     true
    border    false
    compact   false
    ========= =============
    
    corners:

        specifies which corners of the element should be rounded.
        Choices are:
        
        - all
        - top
        - bottom
        - tl (top left)
        - bl (bottom left)
        - tr (top right)
        - br (bottom right)

        Example:
            ``"tl br"``: top-left and bottom-right corners are rounded
    
    blend:
        specifies whether the color and background color should be blended
        together to produce the border color.
    

Functions
---------

``roundClass(tagName, className, options)``:

    Rounds all of the elements that match the ``tagName`` and ``className``
    specifiers, using the options provided.  ``tagName`` or ``className`` can
    be ``null`` to match all tags or classes.  For more information about
    the options, see the ``RoundCorners`` constructor above.


``getElementsComputedStyle(htmlElement, cssProperty, mozillaEquivalentCSS)``:

    Looks up a CSS property for the given element. The element can be
    specified as either a string with the element's ID or the element
    object itself.
    

``hsbToRGB(hue, saturation, brightness)``:

    Computes RGB values from the provided HSB values. The return value is a
    mapping with ``"r"``, ``"g"``, and ``"b"`` keys.
    

``rgbToHSB(r, g, b)``:

    Computes HSB values based on the provided RGB values. The return value is
    a mapping with ``"h"``, ``"s"`` and ``"b"`` keys.
    

``toColorPart(num)``:

    Convert num to a zero padded hexadecimal digit for use in a hexadecimal
    color string.


Authors
=======

- Kevin Dangoor <dangoor@gmail.com>
- Bob Ippolito <bob@redivi.com>
- Originally adapted from Rico <http://openrico.org/> (though little remains)


Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>.  This program is free software;
you can redistribute it and/or modify it under the terms of the
`MIT License`_.
    
.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php

Portions adapted from `Rico`_ are available under the terms of the
`Apache License, Version 2.0`_.

.. _`Apache License, Version 2.0`: http://www.apache.org/licenses/LICENSE-2.0.html
