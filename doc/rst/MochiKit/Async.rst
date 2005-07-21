.. -*- mode: rst -*-

Name
====

MochiKit.Async - manage asynchronous tasks

Synopsis
========

::

    var url = "/src/b/bo/bob/MochiKit.Async/META.json";
    var d = loadJSONDoc(url);
    var gotMetadata = function (meta) {
        if (MochiKit.Async.VERSION == meta.version) {
            alert("You have the newest MochiKit.Async!");
        } else {
            alert("MochiKit.Async " 
                + meta.version
                + " is available, upgrade!");
        }
    };
    var metadataFetchFailed = function (err) {
      alert("The metadata for MochiKit.Async could not be fetched :(");
    };
    d.addCallbacks(gotMetadata, metadataFetchFailed);
    
  
Description
===========

MochiKit.Async provides facilities to manage asynchronous
(as in AJAX [1]_) tasks. The model for asynchronous computation
used in this module is heavily inspired by Twisted [2]_.

Dependencies
============

- `MochiKit.Base`_

.. _`MochiKit.Base`: Base.html

Overview
========

Deferred
--------

The Deferred constructor encapsulates a single value that
is not available yet.  The most important example of this
in the context of a web browser would be an ``XMLHttpRequest``
to a server.  The importance of the Deferred is that it
allows a consistent API to be exposed for all asynchronous
computations that occur exactly once.

The producer of the Deferred is responsible for doing all
of the complicated work behind the scenes.  This often
means waiting for a timer to fire, or waiting for an event
(e.g. ``onreadystatechange`` of ``XMLHttpRequest``).  
It could also be coordinating several events (e.g.
``XMLHttpRequest`` with a timeout, or several Deferreds
(e.g. fetching a set of XML documents that should be 
processed at the same time).

Since these sorts of tasks do not respond immediately, the
producer of the Deferred does the following steps before
returning to the consumer:

1. Create a ``new Deferred();`` object and keep a reference
   to it, because it will be needed later when the value is
   ready.
2. Setup the conditions to create the value requested (e.g.
   create a new ``XMLHttpRequest``, set its 
   ``onreadystatechange``).
3. Return the Deferred object.

Since the value is not yet ready, the consumer attaches
a function to the Deferred that will be called when the
value is ready.  This is not unlike ``setTimeout``, or
other similar facilities you may already be familiar with.
The consumer can also attach an "errback" to the Deferred,
which is a callback for error handling.

When the value is ready, the producer simply calls
``myDeferred.callback(theValue)``.  If an error occurred,
it should call ``myDeferred.errback(theValue)`` instead.
As soon as this happens, the callback that the consumer
attached to the Deferred is called with ``theValue``
as the only argument.

There are quite a few additional "advanced" features
baked into Deferred, such as cancellation and 
callback chains, so take a look at the API
reference if you would like to know more!

API Reference
=============

Errors
------

``AlreadyCalledError``:
    Thrown by a ``Deferred`` if ``.callback`` or
    ``.errback`` are called more than once.

``CancelledError``:
    Thrown by a ``Deferred`` when it is cancelled,
    unless a canceller is present and throws something else.

``BrowserComplianceError``:
    Thrown when the JavaScript runtime is not capable of performing
    the given function.  Currently, this happens if the browser
    does not support ``XMLHttpRequest``.

``GenericError``:
    Results passed to ``.fail`` or ``.errback`` of a ``Deferred``
    are wrapped by this ``Error`` if ``!(result instanceof Error)``.

``XMLHttpRequestError``:
    Thrown when an ``XMLHttpRequest`` does not complete successfully
    for any reason.

Constructors
------------

``Deferred()``:
    Encapsulates a sequence of callbacks in response to a value that
    may not yet be available.  This is modeled after the Deferred class
    from Twisted [3]_.

.. _`Twisted`: http://twistedmatrix.com/

    Why do we want this?  JavaScript has no threads, and even if it did,
    threads are hard.  Deferreds are a way of abstracting non-blocking
    events, such as the final response to an ``XMLHttpRequest``.

    The sequence of callbacks is internally represented as a list
    of 2-tuples containing the callback/errback pair.  For example,
    the following call sequence::

        var d = new Deferred();
        d.addCallback(myCallback);
        d.addErrback(myErrback);
        d.addBoth(myBoth);
        d.addCallbacks(myCallback, myErrback);

    is translated into a ``Deferred`` with the following internal
    representation::

        [
            [myCallback, null],
            [null, myErrback],
            [myBoth, myBoth],
            [myCallback, myErrback]
        ]

    The ``Deferred`` also keeps track of its current status (fired).
    Its status may be one of three things:
    
        
        ===== ================================
        Value Condition
        ===== ================================
        -1    no value yet (initial condition)
        0     success
        1     error
        ===== ================================
    
    A ``Deferred`` will be in the error state if one of the following
    three conditions are met:
    
    1. The result given to callback or errback is "``instanceof Error``"
    2. The callback or errback thew an ``Error`` while executing

    Otherwise, the ``Deferred`` will be in the success state.  The state of the
    ``Deferred`` determines the next element in the callback sequence to run.

    When a callback or errback occurs with the example deferred chain, something
    equivalent to the following will happen (imagine that exceptions are caught
    and returned as-is)::

        // d.callback(result) or d.errback(result)
        if (!(result instanceof Error)) {
            result = myCallback(result);
        }
        if (result instanceof Error) {
            result = myErrback(result);
        }
        result = myBoth(result);
        if (result instanceof Error) {
            result = myErrback(result);
        } else {
            result = myCallback(result);
        }
    
    The result is then stored away in case another step is added to the
    callback sequence.  Since the ``Deferred`` already has a value available,
    any new callbacks added will be called immediately.

    There are two other "advanced" details about this implementation that are 
    useful:

    Callbacks are allowed to return ``Deferred`` instances themselves, so
    you can build complicated sequences of events with (relative) ease.

    The creator of the ``Deferred`` may specify a canceller.  The canceller
    is a function that will be called if ``Deferred.cancel`` is called
    before the ``Deferred`` fires.  You can use this to allow an ``XMLHttpRequest``
    to be cleanly cancelled, for example.  Note that cancel will fire the
    ``Deferred`` with a ``CancelledError`` (unless your canceller throws or
    returns a different ``Error``), so errbacks should be prepared to handle
    that ``Error`` gracefully for cancellable ``Deferreds``.

``Deferred.prototype.cancel()``:
    Cancels a ``Deferred`` that has not yet received a value,
    or is waiting on another ``Deferred`` as its value.

    If a canceller is defined, the canceller is called.
    If the canceller did not return an ``Error``, or there
    was no canceller, then the errback chain is started
    with ``CancelledError``.
        
``Deferred.prototype.callback([result])``:
    Begin the callback sequence with a non-``Error`` result.
    
    *NOTE*: Either ``.callback`` or ``.errback`` should
    be called exactly once on a ``Deferred``.

``Deferred.prototype.errback([result])``:
    Begin the callback sequence with an error result.  If 
    ``!(result instanceof Error)``, it will be wrapped
    with ``GenericError``.

    *NOTE*: Either ``.callback`` or ``.errback`` should
    be called exactly once on a ``Deferred``.

``Deferred.prototype.addBoth(func)``:
    Add the same function as both a callback and an errback as the
    next element on the callback sequence.  This is useful for code
    that you want to guarantee to run, e.g. a finalizer.

``Deferred.prototype.addCallback(func)``:
    Add a single callback to the end of the callback sequence.

``Deferred.prototype.addErrback(func)``:
    Add a single errback to the end of the callback sequence.

``Deferred.prototype.addCallbacks(callback, errback)``:
    Add separate callback and errback to the end of the callback
    sequence.  Either callback or errback may be ``null``,
    but not both.


Functions
---------

``evalJSONRequest(req)``:
    Evaluate a JSON [4]_ ``XMLHttpRequest``

    ``req``:
        The request whose responseText is to be evaluated

    ``returns``:
        A JavaScript object

``succeed([result])``:
    Return a Deferred that has already had ``.callback(result)`` called.

    This is useful when you're writing synchronous code to an asynchronous
    interface: i.e., some code is calling you expecting a Deferred result,
    but you don't actually need to do anything asynchronous.  Just return
    ``succeed(theResult)``.

    See fail for a version of this function that uses a failing ``Deferred``
    rather than a successful one.

    ``result``:
        The result to give to the Deferred's ``.callback(result)`` method.

    returns:
        a new ``Deferred``

``fail([result])``:
    Return a Deferred that has already had '.errback(result)' called.

    See succeed's documentation for rationale.

    ``result``:
        The result to give to the Deferred's ``.errback(result)`` method.

    returns:
        a new ``Deferred``

``doSimpleXMLHttpRequest(url)``:
    Perform a simple ``XMLHttpRequest`` and wrap it with a
    ``Deferred`` that may be cancelled.

    ``url``:
        The URL to GET

    returns:
        ``Deferred`` that will callback with the ``XMLHttpRequest``
        instance on success
    
``loadJSONDoc(url)``:
    Do a simple ``XMLHttpRequest`` to a URL and get the response
    as a JSON [4]_ document.

    ``url``:
        The URL to GET

    returns:
        ``Deferred`` that will callback with the evaluated JSON [4]_
        response upon successful ``XMLHttpRequest``

``getXMLHttpRequest()``:
    Return an ``XMLHttpRequest`` compliant object for the current
    platform.

    In order of preference:

    - ``new XMLHttpRequest()``
    - ``new ActiveXObject('Msxml2.XMLHTTP')``
    - ``new ActiveXObject('Microsoft.XMLHTTP')``
    - ``new ActiveXObject('Msxml2.XMLHTTP.4.0')``

See Also
========

.. [1] AJAX, Asynchronous JavaScript and XML: http://en.wikipedia.org/wiki/AJAX
.. [2] Twisted, an event-driven networking framework written in Python: http://twistedmatrix.com/
.. [3] Twisted Deferred Reference: http://twistedmatrix.com/projects/core/documentation/howto/defer.html
.. [4] JSON, JavaScript Object Notation: http://json.org/

ToDo
====

- Add ``callLater``
- Add some examples
- ``doSimpleXMLHttpRequest`` equivalent that accepts a request
  instead of a URL

Authors
=======

- Bob Ippolito <bob@redivi.com>

Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>.  This program is free software;
you can redistribute it and/or modify it under the terms of the
`MIT License`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
