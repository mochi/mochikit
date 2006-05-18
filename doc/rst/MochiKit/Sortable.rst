.. title:: MochiKit.Sortable - sortable with drag and drop lists

Name
====

MochiKit.Sortable - sortable with drag and drop lists


Synopsis
========

::

    <ul id="dnd_sortable">
        <li>mochibot.com</li>
        <li>pythonmac.org</li>
        <li>undefined.org</li>
        <li>python.org</li>
    </ul>
    <script type="text/javascript">
      MochiKit.Sortable.Sortable.create('dnd_sortable');
    </script>


Description
===========

MochiKit.Sortable add a new Sortable object to manipulate easily
drag&drop in lists.


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.Iter`
- :mochiref:`MochiKit.DOM`
- :mochiref:`MochiKit.Color`
- :mochiref:`MochiKit.Effect`
- :mochiref:`MochiKit.Signal`
- :mochiref:`MochiKit.DragAndDrop`

Overview
========

MochiKit.Sortable mainly contains the Sortable object offering
facilities to manipulate a list and drag its items to reorder it. It
can also be serialized for being send to server. It is ported from
Scriptaculous_.

.. _Scriptaculous: http://script.aculo.us


API Reference
=============

Objects defined
---------------

:mochidef:`SortableObserver`:

    Observer for DragAndDrop object. You normally don't have to access
    this, only for customization purpose.

    *Availability*:
        Available in MochiKit 1.4+


:mochidef:`Sortable.create(element [, options])`:

    Create a new Sortable. Usually you'll call it with a UL element,
    but it can be customized with options to use something else.

    You have the following options:

    ================= ==================
    element           element
    tag               'li'
    dropOnEmpty       false
    overlap           'vertical'
    constraint        'vertical'
    containment       element
    handle            false
    only              false
    hoverclass        null
    ghosting          false
    scroll            false
    scrollSensitivity 20
    scrollSpeed       15
    format            null
    onChange          nothing
    onUpdate          nothing
    ================= ==================

    *Availability*:
        Available in MochiKit 1.4+


:mochidef:`Sortable.destroy(element)`:

    Destroy a previously created sortable. It prevents further use of
    the Sortable functionnality on the element, unless recreated.

    *Availability*:
        Available in MochiKit 1.4+


:mochidef:`Sortable.create(element [, options])`:

    Serialize the content of a Sortable. Useful to send this content
    through a XMLHTTPRequest.

    ====== ==========================================
    tag    tag from the Sortable
    only   only from the Sortable
    name   id of the element
    format format of the Sortalble or /^[^_]*_(.*)$
    ====== ==========================================

    *Availability*:
        Available in MochiKit 1.4+


Authors
=======

- Thomas Herve <therve@gmail.com>
- Bob Ippolito <bob@redivi.com>
- Originally adapted from Script.aculo.us <http://script.aculo.us/>


Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>.  This program is
dual-licensed free software; you can redistribute it and/or modify it
under the terms of the `MIT License`_ or the `Academic Free License
v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php

Portions adapted from `Scriptaculous`_ are available under the terms
of the `MIT License`_.

.. _`Apache License, Version 2.0`: http://www.apache.org/licenses/LICENSE-2.0.html

