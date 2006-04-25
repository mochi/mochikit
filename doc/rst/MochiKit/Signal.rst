.. title:: MochiKit.Signal - Simple universal event handling
.. |---| unicode:: U+2014  .. em dash, trimming surrounding whitespace
   :trim:

Name
====

MochiKit.Signal - Simple universal event handling


Synopsis
========

::

    /*
        Using Signal for DOM events
    */

    // DOM events are also signals. Connect freely! The functions will be
    // called with the custom event as a parameter.

    // calls myClicked.apply(getElement('myID'), event)
    connect('myID', 'onclick', myClicked);

    // calls wasClicked.apply(myObject, event)
    connect('myID', 'onclick', myObject, wasClicked);

    // calls myObject.wasClicked(event)
    connect('myID', 'onclick', myObject, 'wasClicked');    

    // the event is normalized, no more e = e || window.event!
    myObject.wasClicked = function(e) {
        var crossBrowserCoordinates = e.mouse().page;
        // e.mouse().page is a MochiKit.DOM.Coordinates object
    }


    /*
        Using MochiKit.Signal for non-DOM events
    */

    // otherObject.gotFlash() will be called when 'flash' signalled.
    connect(myObject, 'flash', otherObject, 'gotFlash');

    // gotBang.apply(otherObject) will be called when 'bang' signalled.
    // You can access otherObject from within gotBang as 'this'.
    connect(myObject, 'bang', otherObject, gotBang);

    // myFunc.apply(myObject) will be called when 'flash' signalled.
    // You can access myObject from within myFunc as 'this'.
    var ident = connect(myObject, 'flash', myFunc);

    // You may disconnect with the return value from connect
    disconnect(ident);

    // Signal can take parameters. These will be passed along to the connected
    // functions.
    signal(myObject, 'flash');
    signal(myObject, 'bang', 'BANG!');


Description
===========

Event handling was never so easy!

This module takes care of all the hard work |---| figuring out which event
model to use, trying to retrieve the event object, and handling your own
internal events, as well as cleanup when the page is unloaded to handle IE's
nasty memory leakage.

This event system is largely based on Qt's signal/slot system. You should read
more on how that is handled and also how it is used in model/view programming
at: http://doc.trolltech.com/


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.DOM`


Overview
========

Using Signal for DOM Events
---------------------------

When using MochiKit.Signal, you should not directly use the browser's native
event handling for the same events.  That means, no ``onclick="blah"``, 
no ``elem.attachEvent(...)``, and certainly no ``elem.addEventListener(...)``.
This also means that :mochiref:`MochiKit.DOM.addToCallStack` and
:mochiref:`MochiKit.DOM.addLoadEvent` should not be used in combination with
this module.

Signals for DOM objects are named with the 'on' prefix, e.g.:
'onclick', 'onkeyup', etc.

When the signal fires, your slot will be called with exactly one parameter,
the custom event object.


Custom Event Objects for DOM events
-----------------------------------

Signals triggered by DOM events are called with a custom event object as a
parameter.  The custom event object presents a consistent view of the event
across all supported platforms and browsers, and provides many conveniences
not available even in a correct W3C implementation.

Here is a complete list of this object's methods:

    These are always generated:

    event():
        The native event produced by the browser.  You should not need to
        access this.

    type():
        The event type: click, mouseover, keypress, etc. (Does not include
        the 'on' prefix.)

    target():
        The element that triggered the event.

    modifier().alt, modifier().ctrl, modifier().meta, modifier().shift:
        ``true`` if pressed, ``false`` if not.  ``modifier().meta`` will be 
        ``false`` instead of ``undefined`` in IE.
        
    modifier().any:
        ``true`` if any modifier is pressed, ``false`` if not.

    stopPropagation():
        Works like W3C's ``stopPropagation()``.
        
    preventDefault():
        Works like W3C's ``preventDefault()``.
        
    stop():
        Shortcut that calls ``stopPropagation()`` and ``preventDefault()``.

    You should use keydown and keyup to detect control characters,
    and keypressed to detect "printable" characters. key().code will be set to
    0 and key().string will be set to an empty string in a keypress handler if
    a user presses a control character like F1 or Escape. IE will not fire
    your keypressed handler when you press a control character like KEY_F1 or
    KEY_ESCAPE. In your keyup and keydown handlers, Signal will pass the
    keyboard code and a human-readable string like KEY_A or KEY_ARROW_DOWN or
    KEY_NUM_PAD_ASTERISK. See ``_specialKeys`` for a comprehensive list. These
    are generated for keydown and keyup events:

    key().code:
        contains the raw key code, such as 8 for backspace.

    key().string:
        contains a human readable string, such as 'KEY_BACKSPACE' or '!'.
        The complete list is defined in MochiKit.Signal._specialKeys.

    These are only generated for mouse*, click, dblclick, and contextmenu
    (contextmenu doesn't work in Opera):

    mouse().page.x, mouse().page.y:
        represents the cursor position relative to the HTML document. 
        (Equivalent to pageX/Y in Safari, Mozilla, and Opera.)
        
    mouse().client.x, mouse().client.y:
        represents the cursor position relative to the visible portion of the
        HTML document. (Equivalent to clientX/Y on all browsers.)
    
    These are only generated for mouseup, mousedown, click, and dblclick:

    mouse().button.left, mouse().button.right, mouse().button.middle:
        ``true`` or ``false``.  Mac browsers don't report right click
        consistently.  Firefox fires the click and sets modifier().ctrl to
        true, Opera fires the click and sets modifier().meta to true, and
        Safari doesn't fire the click (`Safari Bug 6595`_).

        If you want a right click, I suggest that instead of looking for
        a right click, look for a contextmenu event.
        
        Current versions of Safari won't fire a dblclick event when attached
        via ``connect()`` (`Safari Bug 7790`_).

    This is generated on mouseover and mouseout:

    relatedTarget():
        the document element that the mouse has moved to.

If you find that you're accessing the native event for any reason, create a
`new ticket`_ and we'll look into normalizing the behavior you're looking for.

.. _`new ticket`: http://trac.mochikit.com/newticket
.. _`Safari bug 6595`: http://bugzilla.opendarwin.org/show_bug.cgi?id=6595
.. _`Safari bug 7790`: http://bugzilla.opendarwin.org/show_bug.cgi?id=7790


Memory Usage
------------

Any object that has connected slots (via :mochiref:`connect()`) is referenced
by the Signal mechanism until it is disconnected via :mochiref:`disconnect()`
or :mochiref:`disconnectAll()`.

Signal does not leak.  It registers an 'onunload' event that disconnects all
objects on the page when the browser leaves the page.  However, memory usage
will grow during the page view for every connection made until it is
disconnected.  Even if the DOM object is removed from the document, it
will still be referenced by Signal until it is explicitly disconnected.

In order to conserve memory during the page view, you should ensure to use
:mochiref:`disconnectAll()` any DOM elements that are about to be removed
from the document.


Using Signal for non-DOM objects
--------------------------------

Signals are triggered with the :mochiref:`signal(src, 'signal', ...)`
function.  Additional parameters passed to this are passed onto the
connected slots.  Explicit signals are not required for DOM events.

Slots that are connected to a signal are called in the following manner
when that signal is signalled:

-   If the slot was a single function, then it is called with ``this`` set
    to the object originating the signal with whatever parameters it was
    signalled with.

-   If the slot was an object and a function, then it is called with
    ``this`` set to the object, and with whatever parameters it was
    signalled with.

-   If the slot was an object and a string, then ``object[string]`` is
    called with the parameters to the signal.


API Reference
=============

Functions
---------

:mochidef:`connect(src, signal, dest[, func])`:

    Connects a signal to a slot, and return a unique identifier that can be
    used to disconnect that signal.

    ``src`` is the object that has the signal.  You may pass in a string, in
    which case, it is interpreted as an id for an HTML Element.

    ``signal`` is a string that represents a signal name. If 'src' is an HTML
    Element, Window, or the Document, then it can be one of the 'on-XYZ'
    events. You must include the 'on' prefix, and it must be all
    lower-case.

    ``dest`` and ``func`` describe the slot, or the action to take when the
    signal is triggered.

        -   If ``dest`` is an object and ``func`` is a string, then
            ``dest[func].apply(dest, ...)`` will be called when the signal
            is signalled.

        -   If ``dest`` is an object and ``func`` is a function, then
            ``func.apply(dest, ...)`` will be called when the signal is
            signalled.

        -   If ``func`` is undefined and ``dest`` is a function, then
            ``func.apply(src, ...)`` will be called when the signal is
            signalled.

    No other combinations are allowed and should raise and exception.

    The return value can be passed to :mochiref:`disconnect` to disconnect
    the signal.


:mochidef:`disconnect(ident)`:

    To disconnect a signal, simply pass the ident returned by
    :mochiref:`connect()`. This is similar to how the browser's ``setTimeout``
    and ``clearTimeout`` works.


:mochidef:`signal(src, signal, ...)`:

    This will signal a signal, passing whatever additional parameters on to
    the connected slots. ``src`` and ``signal`` are the same as for
    :mochiref:`connect()`.


Authors
=======

-   Jonathan Gardner <jgardner@jonathangardner.net>
-   Beau Hartshorne <beau@hartshornesoftware.com>
-   Bob Ippolito <bob@redivi.com>


Copyright
=========

Copyright 2006 Jonathan Gardner <jgardner@jonathangardner.net>, Beau 
Hartshorne <beau@hartshornesoftware.com>, and Bob Ippolito <bob@redivi.com>.
This program is dual-licensed free software; you can redistribute it and/or
modify it under the terms of the `MIT License`_ or the
`Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
