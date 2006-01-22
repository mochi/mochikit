.. title:: MochiKit.Effects - add Visual Effects to MochiKit

Name
====

MochiKit.Effects - add Visual Effects to MochiKit

Synopsis
========

::
    // Add an fade effect to an element
    MochiKit.Effect.Fade('myelement');

Description
===========

MochiKit.Effects provides dynamics effects for animating page.

Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.Iter`
- :mochiref:`MochiKit.DOM`
- :mochiref:`MochiKit.Color`

Overview
========

The implementation was adapted from Scriptaculous_.

.. _Scriptaculous: http://script.aculo.us

API Reference
=============

Functions
---------

:mochidef:`toggle(element[, effect[, options]])`:

    Toggle an element between visible and invisible state using an effect.

:mochidef:`tagifyText(element[, tagifyStyle])`:

    Transform a node text into nodes containing one letter by tag.

:mochidef:`multiple(elements, effect[, options])`:

    Launch the same effect on a list of elements.

Basic Effects classes
---------------------

:mochidef:`Base()`:

    Base class to all effects. Define a basic looping service, use it for
    creating new effects.

:mochidef:`Parallel(effecs [, options])`:

    Launch effects in parallel.

:mochidef:`Opacity(element [, options])`:

    Change the opacity of an element progressively.

:mochidef:`Move(element [, options])`:

    Change the position of an element in small steps, creating a moving effect.

:mochidef:`Scale(element, percent [, options])`:

    Change the size of an element.

:mochidef:`Highlight(element [, options])`:

    Highlight an element, flashing with one color.

:mochidef:`ScrollTo(element [, options])`:

    Scroll the window to the position of the given element.

Combination Effects
-------------------

:mochidef:`Fade(element [, options])`:

    Change the opacity of an element until making it disappear.

:mochidef:`Appear(element [, options])`:

    Slowly show an invisible element.

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

Authors
=======

- Thomas Herve <therve@gmail.com>
- Bob Ippolito <bob@redivi.com>
- Originally adapted from Script.aculo.us <http://script.aculo.us/>

Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>.  This program is dual-licensed
free software; you can redistribute it and/or modify it under the terms of the
`MIT License`_ or the `Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php

Portions adapted from `Scriptaculous`_ are available under the terms of the
`MIT License`_.

