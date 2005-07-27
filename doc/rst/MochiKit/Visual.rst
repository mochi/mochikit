.. title:: MochiKit.Visual - visual effects and colors

Name
====

MochiKit.Visual - visual effects and colors


Synopsis
========

::

    // round the corners of all h1 elements
    roundClass("h1", null);
    
    // round the top left corner of the element with the id "title"
    roundElement("title", {corners: "tl"});
    
    // RGB color expressions are supported
    assert(
        objEqual(Color.whiteColor(), Color.fromString("rgb(255,100%, 255)"))
    );

    // So is instantiating directly from HSL or RGB values.
    // Note that fromRGB and fromHSL take numbers between 0.0 and 1.0!
    assert( objEqual(Color.fromRGB(1.0, 1.0, 1.0), Color.fromHSL(0.0, 0.0, 1.0) );

    // Or even SVG color keyword names, as per CSS3!
    assert( Color.fromString("aquamarine"), "#7fffd4" );
        
    // NSColor-like colors built in
    assert( Color.whiteColor().toHexString() == "#ffffff" );
    

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

``Color()``:

    Represents a color.  Component values should be integers between ``0.0``
    and ``1.0``.  You should use one of the ``Color`` factory
    functions such as ``Color.fromRGB``, ``Color.fromHSL``, etc. instead
    of constructing ``Color`` objects directly.

    ``Color`` instances can be compared with ``MochiKit.Base.compare``
    (though ordering is on RGB, so is not particularly meaningful),
    and the default ``toString`` implementation returns
    ``this.toHexString()``.

    Colors are immutable, and much of the architecture is inspired by
    AppKit's NSColor [1]_ 


``Color.fromRGB(red, green, blue, alpha=1.0)``:

    Return a ``Color`` object from the given ``red``, ``green``, ``blue``,
    and ``alpha`` values.  Values should be numbers between ``0`` and ``1.0``.

    If ``alpha`` is not given, then ``1.0`` (completely opaque) will be used.

    Alternate form:
        ``Color.fromRGB({r: red, g: green, b: blue, a: alpha})``


``Color.fromHSL(hue, saturation, lightness, alpha=1.0)``:

    Return a ``Color`` object from the given ``hue``, ``saturation``,
    ``lightness`` values.  Values should be numbers between ``0.0`` and
    ``1.0``.

    If ``alpha`` is not given, then ``1.0`` (completely opaque) will be used.

    Alternate form:
        ``Color.fromHSL({h: hue, s: saturation, b: lightness, a: alpha})``


``Color.fromHexString(hexString)``:

    Returns a ``Color`` object from the given hexadecimal color string.
    For example, ``"#FFFFFF"`` would return a ``Color`` with
    RGB values ``[255/255, 255/255, 255/255]`` (white).


``Color.fromRGBString(rgbString)``:

    Returns a ``Color`` object from the given decimal rgb color string.
    For example, ``"rgb(255,255,255)"`` would return a ``Color`` with
    RGB values ``[255/255, 255/255, 255/255]`` (white).


``Color.fromHSLString(rgbString)``:

    Returns a ``Color`` object from the given decimal hsl color string.
    For example, ``"hsl(0,0,360)"`` would return a ``Color`` with
    RGB values ``[0/360, 0/360, 360/360]`` (white).


``Color.fromName(colorName)``:

    Returns a ``Color`` object corresponding to the given
    SVG 1.0 color keyword name [2]_ as per the W3C CSS3
    Color Module [3]_.  ``"transparent"`` is also accepted
    as a color name, and will return ``Color.transparentColor()``.


``Color.fromString(rgbOrHexString)``:

    Returns a ``Color`` object from the given RGB, HSL, hex, or name.
    Will return ``null`` if the string can not be parsed by any of these 
    methods.

    See ``Color.fromHexString``, ``Color.fromRGBString``, 
    ``Color.fromHSLString`` and ``Color.fromName`` more information.
    

``Color.fromBackground(elem)``:

    Returns a ``Color`` object based on the background of the provided
    element.
    

``Color.namedColors()``:

    Returns an object with properties for each SVG 1.0 color keyword
    name [2]_ supported by CSS3 [3]_.  Property names are the color keyword
    name in lowercase, and the value is a string suitable for
    ``Color.fromString()``.


``Color.prototype.colorWithAlpha(alpha)``:

    Return a new ``Color`` based on this color, but with the provided
    ``alpha`` value.


``Color.prototype.colorWithHue(hue)``:

    Return a new ``Color`` based on this color, but with the provided
    ``hue`` value.


``Color.prototype.colorWithSaturation(saturation)``:

    Return a new ``Color`` based on this color, but with the provided
    ``saturation`` value.


``Color.prototype.colorWithLightness(lightness)``:

    Return a new ``Color`` based on this color, but with the provided
    ``lightness`` value.


``Color.prototype.darkerColorWithLevel(level)``:

    Return a new ``Color`` based on this color, but darker by the given
    ``level`` (between ``0`` and ``1.0``).


``Color.prototype.lighterColorWithLevel(level)``:

    Return a new ``Color`` based on this color, but lighter by the given
    ``level`` (between ``0`` and ``1.0``).


``Color.prototype.blendedColor(other, fraction=0.5)``:

    Return a new ``Color`` whose RGBA component values are a weighted sum
    of this color and ``other``.  Each component of the returned color
    is the ``fraction`` of other's value plus ``1 - fraction`` of this
    color's.


``Color.prototype.isLight()``:

    Return ``true`` if the lightness value of this color is greater than
    ``0.5``.

    Note that ``alpha`` is ignored for this calculation (color components
    are not premultiplied).

``Color.prototype.isDark()``:

    Return ``true`` if the lightness value of this color is less than or
    equal to ``0.5``.

    Note that ``alpha`` is ignored for this calculation (color components
    are not premultiplied).


``Color.prototype.toRGBString()``:

    Return the decimal ``"rgb(red, green, blue)"`` string representation of this
    color.
    
    If the alpha component is not ``1.0`` (fully opaque), the
    ``"rgba(red, green, blue, alpha)"`` string representation will be used.

    For example::

        assert( Color.whiteColor().toRGBString() == "rgb(255,255,255)" );


``Color.prototype.toHSLString()``:

    Return the decimal ``"hsl(hue, saturation, lightness)"``
    string representation of this color.

    If the alpha component is not ``1.0`` (fully opaque), the
    ``"hsla(hue, saturation, lightness, alpha)"`` string representation
    will be used.

    For example::

        assert( Color.whiteColor().toHSLString() == "hsl(0,0,360)" );


``Color.prototype.toHexString()``:

    Return the hexadecimal ``"#RRGGBB"`` string representation of this color.

    Note that the alpha component is completely ignored for hexadecimal
    string representations!

    For example::

        assert( Color.whiteColor().toHexString() == "#FFFFFF" );


``Color.prototype.asRGB()``:

    Return the RGB (red, green, blue, alph) components of this color as an
    object with ``r``, ``g``, ``b``, and ``a`` properties that have
    values between ``0.0`` and ``1.0``.


``Color.prototype.asHSL()``:

    Return the HSL (hue, saturation, lightness, alpha) components of this
    color as an object with ``h``, ``s``, ``l`` and ``a`` properties
    that have values between ``0.0`` and ``1.0``.


``Color.blackColor()``:

    Return a ``Color`` object whose RGB values are 0, 0, 0
    (#000000).


``Color.blueColor()``:
    
    Return a ``Color`` object whose RGB values are 0, 0, 1
    (#0000ff).


``Color.brownColor()``:

    Return a ``Color`` object whose RGB values are 0.6, 0.4, 0.2
    (#996633).


``Color.cyanColor()``:

    Return a ``Color`` object whose RGB values are 0, 1, 1
    (#00ffff).


``Color.darkGrayColor()``:

    Return a ``Color`` object whose RGB values are 1/3, 1/3, 1/3
    (#555555).


``Color.grayColor()``:

    Return a ``Color`` object whose RGB values are 0.5, 0.5, 0.5
    (#808080).


``Color.greenColor()``:

    Return a ``Color`` object whose RGB values are 0, 1, 0.
    (#00ff00).


``Color.lightGrayColor()``:

    Return a ``Color`` object whose RGB values are 2/3, 2/3, 2/3
    (#aaaaaa).


``Color.magentaColor()``:

    Return a ``Color`` object whose RGB values are 1, 0, 1
    (#ff00ff).


``Color.orangeColor()``:

    Return a ``Color`` object whose RGB values are 1, 0.5, 0
    (#ff8000).


``Color.purpleColor()``:

    Return a ``Color`` object whose RGB values are 0.5, 0, 0.5
    (#800080).


``Color.redColor()``:

    Return a ``Color`` object whose RGB values are 1, 0, 0
    (#ff0000).


``Color.whiteColor()``:

    Return a ``Color`` object whose RGB values are 1, 1, 1
    (#ffffff).


``Color.yellowColor()``:

    Return a ``Color`` object whose RGB values are 1, 1, 0
    (#ffff00).


``Color.transparentColor()``:

    Return a ``Color`` object that is completely transparent
    (has alpha component of 0).


Functions
---------

``roundElement(element[, options])``:

    Immediately round the corners of the specified element.
    The element can be given as either a string 
    with the element ID, or as an element object.
    
    The options mapping has the following defaults:

    ========= =================
    corners   ``"all"``
    color     ``"fromElement"``
    bgColor   ``"fromParent"``
    blend     ``true``
    border    ``false``
    compact   ``false``
    ========= =================
    
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
    

``roundClass(tagName[, className[, options]])``:

    Rounds all of the elements that match the ``tagName`` and ``className``
    specifiers, using the options provided.  ``tagName`` or ``className`` can
    be ``null`` to match all tags or classes.  For more information about
    the options, see the ``roundElement`` function above.


``getElementsComputedStyle(htmlElement, cssProperty, mozillaEquivalentCSS)``:

    Looks up a CSS property for the given element. The element can be
    specified as either a string with the element's ID or the element
    object itself.
    

``hslToRGB(hue, saturation, lightness, alpha)``:

    Computes RGB values from the provided HSL values. The return value is a
    mapping with ``"r"``, ``"g"``, ``"b"`` and ``"a"`` keys.
    
    Alternate form:
        ``hslToRGB({h: hue,  s: saturation, l: lightness, a: alpha})``.

    ``hslToRGB`` is not exported by default when using JSAN.


``rgbToHSL(red, green, blue, alpha)``:

    Computes HSL values based on the provided RGB values. The return value is
    a mapping with ``"h"``, ``"s"``, ``"l"`` and ``"a"`` keys.
    
    Alternate form:
        ``rgbToHSL({r: red, g: green, b: blue, a: alpha})``.

    ``rgbToHSL`` is not exported by default when using JSAN.


``toColorPart(num)``:

    Convert num to a zero padded hexadecimal digit for use in a hexadecimal
    color string.  Num should be an integer between ``0`` and ``255``.

    ``toColorPart`` is not exported by default when using JSAN.


``clampColorComponent(num, scale)``:

    Returns ``num * scale`` clamped between ``0`` and ``scale``.

    ``clampColorComponent`` is not exported by default when using JSAN.


See Also
========

.. [1] Application Kit Reference - NSColor: http://developer.apple.com/documentation/Cocoa/Reference/ApplicationKit/ObjC_classic/Classes/NSColor.html
.. [2] SVG 1.0 color keywords: http://www.w3.org/TR/SVG/types.html#ColorKeywords
.. [3] W3C CSS3 Color Module: http://www.w3.org/TR/css3-color/#svg-color


Authors
=======

- Kevin Dangoor <dangoor@gmail.com>
- Bob Ippolito <bob@redivi.com>
- Originally adapted from Rico <http://openrico.org/> (though little remains)


Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>.  This program is dual-licensed
free software; you can redistribute it and/or modify it under the terms of the
`MIT License`_ or the `Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php

Portions adapted from `Rico`_ are available under the terms of the
`Apache License, Version 2.0`_.

.. _`Apache License, Version 2.0`: http://www.apache.org/licenses/LICENSE-2.0.html
