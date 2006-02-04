.. title:: MochiKit.Visual - visual effects

Name
====

MochiKit.Visual - visual effects


Synopsis
========

::

    // round the corners of all h1 elements
    roundClass("h1", null);
    
    // round the top left corner of the element with the id "title"
    roundElement("title", {corners: "tl"});

    // Add an fade effect to an element
    Fade('myelement');
    

Description
===========

MochiKit.Visual provides visual effects and support functions for visuals.


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.Iter`
- :mochiref:`MochiKit.DOM`
- :mochiref:`MochiKit.Color`

Overview
========

MochiKit.Visual provides different visual effect: rounded corners and
animations for your HTML elements. Rounded corners are created completely
through CSS manipulations and require no external images or style sheets.
This implementation was adapted from Rico_. Dynamic effects are ported from
Scriptaculous_.

.. _Rico: http://www.openrico.org

.. _Scriptaculous: http://script.aculo.us


API Reference
=============

Functions
---------

:mochidef:`roundClass(tagName[, className[, options]])`:

    Rounds all of the elements that match the ``tagName`` and ``className``
    specifiers, using the options provided.  ``tagName`` or ``className`` can
    be ``null`` to match all tags or classes.  For more information about
    the options, see the :mochiref:`roundElement` function.


:mochidef:`roundElement(element[, options])`:

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
    
:mochidef:`toggle(element[, effect[, options]])`:

    Toggle an element between visible and invisible state using an effect.

    effect:
        
        One of the visual pairs to use, between 'slide', 'blind', 'appear', 
        and 'size'.

:mochidef:`tagifyText(element[, tagifyStyle])`:

    Transform a node text into nodes containing one letter by tag.

    tagifyStyle:

        style to apply to character nodes, default to 'position: relative'.

:mochidef:`multiple(elements, effect[, options])`:

    Launch the same effect on a list of elements.

Basic Effects classes
---------------------

:mochidef:`DefaultOptions`:

    Default options for all Effect creation.

    =========== ========================================
    transition  ``MochiKit.Visual.Transitions.sinoidal``
    duration    ``1.0``
    fps         ``25.0``
    sync        ``false``
    from        ``0.0``
    to          ``1.0``
    delay       ``0.0``
    queue       ``'parallel'``
    =========== ========================================

:mochidef:`Base()`:

    Base class to all effects. Define a basic looping service, use it for
    creating new effects.

    You can override the methods ``setup``, ``update`` and ``finish```.

:mochidef:`Parallel(effects [, options])`:

    Launch effects in parallel.

:mochidef:`Opacity(element [, options])`:

    Change the opacity of an element progressively.

    options:

    ====== ========
    from   ``0.0``
    to     ``1.0``
    ====== ========

:mochidef:`Move(element [, options])`:

    Change the position of an element in small steps, creating a moving effect.

    options:

    ========= ================
    x         ``0``
    y         ``0``
    position  ``'relative'``
    ========= ================

:mochidef:`Scale(element, percent [, options])`:

    Change the size of an element.

    percent:
    
        Final wanted size in percent of current size. The size will be reduced
        if the value is between 0 and 1, and raised if the value is above 1.

    options:

    ================ ============
    scaleX           ``true``
    scaleY           ``true``
    scaleContent     ``true``
    scaleFromCenter  ``false``
    scaleMode        ``'box'``
    scaleFrom        ``100.0``
    scaleTo          ``percent``
    ================ ============


:mochidef:`Highlight(element [, options])`:

    Highlight an element, flashing with one color.

    options:

    =========== ==============
    startcolor  ``'#ffff99'``
    =========== ==============

:mochidef:`ScrollTo(element [, options])`:

    Scroll the window to the position of the given element.

Combination Effects
-------------------

:mochidef:`Fade(element [, options])`:

    Change the opacity of an element until making it disappear.

    options:

    ====== =============================================
    from   ``MochiKit.DOM.getOpacity(element) || 1.0``
    to     ``0.0``
    ====== =============================================

:mochidef:`Appear(element [, options])`:

    Slowly show an invisible element.

    options:

    ===== =========
    from  ``0.0``
    to    ``1.0``
    ===== =========

:mochidef:`Puff(element [, options])`:

    Make an element double size, and then make it disappear.

:mochidef:`BlindUp(element [, options])`:

    Blind an element up, changing its vertical size to 0.

:mochidef:`BlindDown(element [, options])`:

    Blind an element down, restoring its vertical size.

:mochidef:`SwitchOff(element [, options])`:

    A switch-off like effect, making the element disappear.

:mochidef:`DropOut(element [, options])`:

    Make the element fall and fade.

:mochidef:`Shake(element [, options])`:

    Shake an element from left to right.

:mochidef:`SlideDown(element [, options])`:

    Slide an element down.

:mochidef:`SlideUp(element [, options])`:

    Slide an element up.

:mochidef:`Squish(element [, options])`:

    Reduce the horizontal and vertical sizes at the same time, using the
    top left corner.

:mochidef:`Grow(element [, options])`:

    Restore the size of an element.

:mochidef:`Shrink(element [, options])`:

    Shrink an element to its center.

:mochidef:`Pulsate(element [, options])`:

    Switch an element between Appear and Fade.

:mochidef:`Fold(element [, options])`:

    Reduce first the vertical size, and then the horizontal size.

See Also
========

.. [1] Application Kit Reference - NSColor: http://developer.apple.com/documentation/Cocoa/Reference/ApplicationKit/ObjC_classic/Classes/NSColor.html
.. [2] SVG 1.0 color keywords: http://www.w3.org/TR/SVG/types.html#ColorKeywords
.. [3] W3C CSS3 Color Module: http://www.w3.org/TR/css3-color/#svg-color


Authors
=======

- Kevin Dangoor <dangoor@gmail.com>
- Bob Ippolito <bob@redivi.com>
- Thomas Herve <therve@gmail.com>
- Round corners originally adapted from Rico <http://openrico.org/> (though little remains)
- Effects originally adapted from Script.aculo.us <http://script.aculo.us/>


Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>.  This program is dual-licensed
free software; you can redistribute it and/or modify it under the terms of the
`MIT License`_ or the `Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php

Portions adapted from `Rico`_ are available under the terms of the
`Apache License, Version 2.0`_.

Portions adapted from `Scriptaculous`_ are available under the terms of the
`MIT License`_.

.. _`Apache License, Version 2.0`: http://www.apache.org/licenses/LICENSE-2.0.html
