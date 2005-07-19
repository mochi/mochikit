.. -*- mode: rst -*-

MochiKit.Async
==============

Errors
------

AlreadyCalledError:
    Thrown by the Deferred if callback or errback happens
    after it was already fired.

CancelledError:
    Thrown by the Deferred cancellation mechanism.

BrowserComplianceError:
    Thrown when the JavaScript runtime is not capable of performing
    the given function.  Technically, this should really never be
    raised because a non-conforming JavaScript runtime probably
    isn't going to support exceptions in the first place.

GenericError:
    Objects passed to fail or errback are wrapped by GenericError
    if they are not instanceof Error

XMLHttpRequestError:
    Raised when an XMLHttpRequest does not complete for any reason.

Constructors
------------

Deferred():
    Encapsulates a sequence of callbacks in response to a value that
    may not yet be available.  This is modeled after the Deferred class
    from `Twisted`_.

.. _`Twisted`: http://twistedmatrix.com/

    Why do we want this?  JavaScript has no threads, and even if it did,
    threads are hard.  Deferreds are a way of abstracting non-blocking
    events, such as the final response to an XMLHttpRequest.

    The sequence of callbacks is internally represented as a list
    of 2-tuples containing the callback/errback pair.  For example,
    the following call sequence::

        var d = new Deferred();
        d.addCallback(myCallback);
        d.addErrback(myErrback);
        d.addBoth(myBoth);
        d.addCallbacks(myCallback, myErrback);

    is translated into a Deferred with the following internal
    representation::

        [
            [myCallback, null],
            [null, myErrback],
            [myBoth, myBoth],
            [myCallback, myErrback]
        ]

    The Deferred also keeps track of its current status (fired).
    Its status may be one of three things:
    
        
        ===== ================================
        Value Condition
        ===== ================================
        -1    no value yet (initial condition)
        0     success
        1     error
        ===== ================================
    
    A Deferred will be in the error state if one of the following
    three conditions are met:
    
    1. The result given to callback or errback is "instanceof" Error
    2. The previous callback or errback raised an exception while executing
    3. The previous callback or errback returned a value "instanceof" Error

    Otherwise, the Deferred will be in the success state.  The state of the
    Deferred determines the next element in the callback sequence to run.

    When a callback or errback occurs with the example deferred chain, something
    equivalent to the following will happen (imagine that exceptions are caught
    and returned)::

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
    callback sequence.  Since the Deferred already has a value available,
    any new callbacks added will be called immediately.

    There are two other "advanced" details about this implementation that are 
    useful:

    Callbacks are allowed to return Deferred instances themselves, so
    you can build complicated sequences of events with ease.

    The creator of the Deferred may specify a canceller.  The canceller
    is a function that will be called if Deferred.cancel is called before
    the Deferred fires.  You can use this to implement clean aborting of an
    XMLHttpRequest, etc.  Note that cancel will fire the deferred with a
    CancelledError (unless your canceller returns another kind of error),
    so the errbacks should be prepared to handle that error for cancellable
    Deferreds.

Deferred.prototype.cancel():
    Cancels a Deferred that has not yet received a value,
    or is waiting on another Deferred as its value.

    If a canceller is defined, the canceller is called.
    If the canceller did not return an error, or there
    was no canceller, then the errback chain is started
    with CancelledError.
        
Deferred.prototype.callback([result]):
    Begin the callback sequence with a non-error result.
    
    NOTE: callback or errback should only be called once
    on a given Deferred.

Deferred.prototype.errback([result]):
    Begin the callback sequence with an error result.  If result is not given
    or is not instanceof Error, it will be wrapped with GenericError.

    NOTE: callback or errback should only be called once
    on a given Deferred.

Deferred.prototype.addBoth(func):
    Add the same function as both a callback and an errback as the
    next element on the callback sequence.  This is useful for code
    that you want to guarantee to run, e.g. a finalizer.

Deferred.prototype.addCallback(func):
    Add a single callback to the end of the callback sequence.

Deferred.prototype.addErrback(func):
    Add a single errback to the end of the callback sequence.

Deferred.prototype.addCallbacks(callback, errback):
    Add separate callback and errback to the end of the callback
    sequence.  Either callback or errback may be null, but not both.


Functions
---------

evalJSONRequest(req):
    Evaluate a JSON (JavaScript Object Notation) XMLHttpRequest

    req:
        The request whose responseText is to be evaluated

    returns:
        A JavaScript object

succeed([result]):
    Return a Deferred that has already had '.callback(result)' called.

    This is useful when you're writing synchronous code to an asynchronous
    interface: i.e., some code is calling you expecting a Deferred result,
    but you don't actually need to do anything asynchronous.  Just return
    succeed(theResult).

    See fail for a version of this function that uses a failing Deferred
    rather than a successful one.

    result:
        The result to give to the Deferred's 'callback' method.

    returns:
        a new Deferred

fail([result]):
    Return a Deferred that has already had '.errback(result)' called.

    See succeed's documentation for rationale.

    result:
        The same argument that Deferred.errback takes.

    returns:
        a new Deferred

doSimpleXMLHttpRequest(url):
    Perform a simple cancellable XMLHttpRequest using a Deferred.

    url:
        The URL to GET

    returns:
        Deferred that will callback with the XMLHttpRequest instance
        on success
    
loadJSONDoc(url):
    Do a simple XMLHttpRequest to a URL and get the response
    as a JSON document.

    url:
        The URL to GET

    returns:
        Deferred that will callback with the evaluated JSON response
        upon successful XMLHttpRequest
