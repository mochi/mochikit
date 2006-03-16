.. title:: MochiKit.Signal - Simple universal event handling

Name
====

MochiKit.Signal - Simple universal event handling


Synopsis
========

::

    // Allow your objects to create events.
    var myObject = {};
    registerSignals(myObject, ['flash', 'bang']);

    // otherObject.gotFlash() will be called when 'flash' signalled.
    connect(myObject, 'flash', otherObject, 'gotFlash');

    // gotBang.apply(otherObject) will be called when 'bang' signalled.
    // You can access otherObject from within gotBang as 'this'.
    connect(myObject, 'bang', otherObject, gotBang);

    // myFunc.apply(myObject) will be called when 'flash' signalled.
    // You can access myObject from within myFunc as 'this'.
    connect(myObject, 'flash', myFunc);

    // You may disconnect with disconnect() and the same parameters.

    // Signal can take parameters. These will be passed along to the connected
    // functions.
    signal(myObject, 'flash');
    signal(myObject, 'bang', 'BANG!');

    // DOM events are also signals. Connect freely! The functions will be
    // called with the event as a parameter.

    // calls myClicked.apply($('myID'), event)
    connect('myID', 'onclick', myClicked);

    // calls wasClicked.apply(myObject, event)
    connect($('myID'), 'onclick', myObject, wasClicked);

    // calls myObject.wasClicked(event)
    connect($('myID'), 'onclick', myObject, 'wasClicked');    

    // the event is normalized, no more e = e || window.event!
    myOjbect.wasClicked = function(e) {
        var crossBrowserCoordinates = e.mouse().page;
        // e.mouse().page is a MochiKit.DOM.Coordinates object
    }


Description
===========

Event handling was never so easy!

This module takes care of all the hard work---figuring out which event model
to use, trying to retrieve the event object, and handling your own internal
events, as well as cleanup when the page is unloaded to handle IE's nasty
memory leakage.

This event system is largely based on Qt's signal/slot system. You should read
more on how that is handled and also how it is used in model/view programming
at: http://doc.trolltech.com/

Here are the rules for the signal and slot system.

1.  Don't use the browser event handling.  That means, no ``onclick="blah"``,
    no ``elem.attachEvent(...)``, and certainly no
    ``elem.addEventListener(...)``.

2.  Objects other than DOM objects (window, document, or any HTMLElement)
    must have its signals declared via :mochiref:`registerSignals()`
    before they can be used.

3.  For DOM objects (window, document, or any HTMLElement), the signals
    already exist and are named 'onclick', 'onkeyup', etc... just like they
    are named already.

4.  The following are acceptable for slots:

	-   A function
	-   An object and a function
	-   An object and a string
	

5.  You may connect or disconnect slots to signals freely using the
    :mochiref:`connect()` and :mochiref:`disconnect()` methods.  The
    same parameters to :mochiref:`disconnect` will only remove a previous
    connection made with the same parameters to :mochiref:`connect`.
    Also, connecting multiple times only leaves one connection in place.

6.  Slots that are connected to a signal are called when that signal is
    signalled.

    -   If the slot was a single function, then it is called with ``this`` set
        to the object originating the signal with whatever parameters it was
        signalled with.

    -   If the slot was an object and a function, then it is called with
        ``this`` set to the object, and with whatever parameters it was
        signalled with.

    -   If the slot was an object and a string, then ``object[string]`` is
        called with the parameters to the signal.

7.  Signals are triggered with the :mochiref:`signal(src, 'signal', ...)`
    function.  Additional parameters passed to this are passed onto the
    connected slots.

8.  Signals triggered by DOM events are called with a custom event object as
    a parameter.  Use ``customObject.stop()`` to do the W3C equivalent of
    ``stopPropagation`` and ``preventDefault``.  You can grab the native event
    by accessing ``customObject.event()``.  Here is a complete list of this
    object's methods:

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

    Note that you should use keydown and keyup to detect control characters,
    and keypressed to detect "printable" characters.  Some browsers will
    return control characters for keypressed. These are generated for keydown
    and keyup events:

    key().code:
        contains the raw key code, such as 8 for backspace.

    key().string:
        contains a human readable string, such as 'KEY_BACKSPACE' or '!'.
        The complete list is defined in MochiKit.Signal._specialKeys.

    These are only generated for mouse*, click, dblclick, and contextmenu
    (note that contextmenu doesn't work in Opera):

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
        Safari doesn't fire the click.

        The folks on #webkit agree that Safari's behavior is strange, and asked 
        us to file a bug report:
        http://bugzilla.opendarwin.org/show_bug.cgi?id=6595

        If you want a right click, I suggest that instead of looking for
        a right click, look for a contextmenu event.

    This is generated on mouseover and mouseout:

    relatedTarget():
        the document element that the mouse has moved to.

If you find that you're accessing the native event for any reason, create a
`new ticket`_ and we'll look into normalizing the behavior you're looking for.

.. _`new ticket`: http://trac.mochikit.com/newticket


Dependencies
============

- :mochiref:`MochiKit.Base`
- :mochiref:`MochiKit.DOM`


Overview
========


API Reference
=============

Functions
---------

:mochidef:`connect(src, signal, dest[, func])`:

    Connects a signal to a slot.

    ``src`` is the object that has the signal.  You may pass in a string, in
    which case, it is interpreted as an id for an HTML Element.

    ``signal`` is a string that represents a signal name. If 'src' is an HTML
    Element, Window, or the Document, then it can be one of the 'on-XYZ'
    events. Note that you must include the 'on' prefix, and it must be all
    lower-case. If ``src`` is another kind of object, the signal must be
    previously registered with :mochiref:`registerSignals()`.

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

    You may call :mochiref:`connect()` multiple times with the same connection
    paramters.  However, only a single connection will be made.


:mochidef:`disconnect(src, signal, dest[, func])`:

    When :mochiref:`disconnect()` is called, it will disconnect whatever
    connection was made given the same parameters to :mochiref:`connect()`.
    Note that if you want to pass a closure to :mochiref:`connect()`, you'll
    have to remember it if you want to later :mochiref:`disconnect()` it.


:mochidef:`registerSignals(src, signals)`:

    This will register signals for the object ``src``.  Note that a string
    here is not allowed -- you don't need to register signals for DOM objects.
    'signals' is an array of strings.

    You may register the same signals multiple times; subsequent
    registerSignals calls with the same signal names will have no effect,
    and the existing connections, if any, will not be lost.


:mochidef:`signal(src, signal, ...)`:

    This will signal a signal, passing whatever additional parameters on to
    the connected slots. ``src`` and ``signal`` are the same as for
    :mochiref:`connect()`.


Authors
=======

-   Jonathan Gardner <jgardner@jonathangardner.net>
-   Beau Hartshorne <beau@hartshornesoftware.com>


Copyright
=========

Copyright 2006 Jonathan Gardner <jgardner@jonathangardner.net> and Beau 
Hartshorne <beau@hartshornesoftware.com>.  This program is dual-licensed free
software; you can redistribute it and/or modify it under the terms of the `MIT
License`_ or the `Academic Free License v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
