.. title:: MochiKit.DragAndDrop - drag and drop elements with MochiKit

Name
====

MochiKit.DragAndDrop - drag and drop elements with MochiKit

Synopsis
========

::

    // Create a draggable
    new Draggable('mydrag');

    // Create a corresponding droppable
    new Droppable('mydrop', {
        accept: 'drag-class',
        ondrop: function (element) {
            alert('You dropped on me ' + element.id);
        }
    });

Description
===========

MochiKit.DragAndDrop enables you the power of dragging elements through your
pages, for richer interfaces.

Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.Iter`
- :mochiref:`MochiKit.DOM`
- :mochiref:`MochiKit.Color`
- :mochiref:`MochiKit.Effect`
- :mochiref:`MochiKit.Signal`

Overview
========

The implementation was adapted from Scriptaculous_.

.. _Scriptaculous: http://script.aculo.us

API Reference
=============

Functions
---------

:mochidef:`Draggable(element[, options])`:

    A object that can be drag with the mouse.

    You have the following options:

    ============= ===========================
    handle        ``false``
    starteffect   ``MochiKit.Effect.Opacity``
    reverteffect  ``MochiKit.Effect.Move``
    endeffect     ``MochiKit.Effect.Opacity``
    zindex        ``1000``
    revert        ``false``
    snap          ``false``
    selectclass   ``null``
    onselect      ``null``
    ondeselect    ``null``
    ghosting      ``null``
    change        ``null``
    ============= ===========================
    

:mochidef:`Droppable(element[, options])`:

    A object where you can drop a draggable.

    You have the following options:

    ============= ===========================
    greedy        ``true``
    hoverclass    ``null``
    activeclass   ``null``
    containment   ``null``
    accept        ``null``
    hoverfunc     ``null``
    onhover       ``null``
    onactive      ``null``
    ondrop        ``null``
    ============= ===========================

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


