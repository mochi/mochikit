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

.. _`MochiKit.Base`: Base.html

- `MochiKit.DOM`_

.. _`MochiKit.DOM`: DOM.html


Overview
========

At this time, MochiKit.Visual provides one visual effect: rounded corners
for your HTML elements. These rounded corners are created completely
through CSS manipulations and require no external images or style sheets.
This implementation was adapted from Rico_.

.. _Rico: http://www.openrico.org

The Visual package also includes some functions for computing colors and a
Color object that provides some useful methods for working with colors.

API Reference
=============

Constructors
------------

``Color(red, green, blue)``:

    Represents a color.
    
``Color.prototype.setRed(r)``:

    Sets the red value of this color.

``Color.prototype.setGreen(g)``:

    Sets the green value of this color.

``Color.prototype.setBlue(b)``:

    Sets the blue value of this color.

``Color.prototype.setHue(h)``:

    Sets this color's RGB values based on the provided hue value.

``Color.prototype.setSaturation(s)``:

    Sets this color's RGB values based on the provided saturation value.

``Color.prototype.setBrightness(b)``:

    Sets this color's RGB values based on the provided brightness value.

``RoundCorners(element, options)``:

    When instantiated, this will immediately round the corners of the
    specified element. The element can be given as either a string 
    with the element ID, or as an element object.
    
    The options mapping has the following defaults:
    * corners : "all",
    * color   : "fromElement",
    * bgColor : "fromParent",
    * blend   : true,
    * border  : false,
    * compact : false
    
    *corners* specifies which corners of the element should be rounded.
    Choices are: all, top, bottom, tl (top left), bl (bottom left),
    tr (top right), br (bottom right).
    
    *blend* specifies whether the color and background color should be blended
    together to produce the border color.
    
Functions
---------

``roundClass(tagName, className, options)``:

    Rounds all of the elements that match the tagName and className
    specifiers, using the options provided. tagName or className can
    be null to match all tags or classes. For more information about
    the options, see the RoundCorners constructor above.

``createFromHex(hexCode)``:

    Constructs a Color object based on the hex code provided. The code
    can be passed in with or without a leading "#".
    

``getElementsComputedStyle(htmlElement, cssProperty, mozillaEquivalentCSS)``:

    Looks up a CSS property for the given element. The element can be
    specified as either a string with the element's ID or the element
    object itself.
    
``createColorFromBackground(elem)``:

    Creates a Color object based on the background of the provided
    element.
    
``HSBtoRGB(hue, saturation, brightness)``:

    Computes RGB values from the provided HSB values. The return value is a
    mapping with "r", "g", and "b" keys.
    
``RGBtoHSB(r, g, b)``:

    Computes HSB values based on the provided RGB values. The return value is
    a mapping with "h", "s" and "b" keys.
    