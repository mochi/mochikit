/***

MochiKit.Async 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide("MochiKit.Async");
    dojo.require("MochiKit.Base");
}
if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base", []);
}

try {
    if (typeof(MochiKit.Base) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.Async depends on MochiKit.Base!";
}

if (typeof(MochiKit.Async) == 'undefined') {
    MochiKit.Async = {};
}

MochiKit.Async.NAME = "MochiKit.Async";
MochiKit.Async.VERSION = "0.80";
MochiKit.Async.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}
MochiKit.Async.toString = function () {
    return this.__repr__();
}

MochiKit.Async.AlreadyCalledError = function (deferred) {
    /***

    Raised by the Deferred if callback or errback happens
    after it was already fired.

    ***/
    this.deferred = deferred;
};
MochiKit.Async.AlreadyCalledError.prototype = new MochiKit.Base.NamedError("MochiKit.Async.AlreadyCalledError");

MochiKit.Async.CancelledError = function (deferred) {
    /***

    Raised by the Deferred cancellation mechanism.

    ***/
    this.deferred = deferred;
};
MochiKit.Async.CancelledError.prototype = new MochiKit.Base.NamedError("MochiKit.Async.CancelledError");

MochiKit.Async.BrowserComplianceError = function (msg) {
    /***

    Raised when the JavaScript runtime is not capable of performing
    the given function.  Technically, this should really never be
    raised because a non-conforming JavaScript runtime probably
    isn't going to support exceptions in the first place.

    ***/
    this.message = msg;
};
MochiKit.Async.BrowserComplianceError.prototype = new MochiKit.Base.NamedError("MochiKit.Async.BrowserComplianceError");

MochiKit.Async.GenericError = function (msg) {
    this.message = msg;
};
MochiKit.Async.GenericError.prototype = new MochiKit.Base.NamedError("MochiKit.Async.GenericError");

MochiKit.Async.XMLHttpRequestError = function (req, msg) {
    /***

    Raised when an XMLHttpRequest does not complete for any reason.

    ***/
    this.req = req;
    this.message = msg;
    try {
        // Strange but true that this can raise in some cases.
        this.number = req.status;
    } catch (e) {
        // pass
    }
};
MochiKit.Async.XMLHttpRequestError.prototype = new MochiKit.Base.NamedError("MochiKit.Async.XMLHttpRequestError");


MochiKit.Async.Deferred = function (/* optional */ canceller) {
    /***

    Encapsulates a sequence of callbacks in response to a value that
    may not yet be available.  This is modeled after the Deferred class
    from Twisted <http://twistedmatrix.com>.

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
    
        -1: no value yet (initial condition)
         0: success
         1: error
    
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
    
    ***/

    
    this.chain = [];
    this.id = this._nextId();
    this.fired = -1;
    this.paused = 0;
    this.results = [null, null];
    this.canceller = canceller;
    this.silentlyCancelled = false;
};

MochiKit.Async.Deferred.prototype.repr = function () {
    var state;
    if (this.fired == -1) {
        state = 'unfired';
    } else if (this.fired == 0) {
        state = 'success';
    } else {
        state = 'error';
    }
    return 'Deferred(' + this.id + ', ' + state + ')';
};

MochiKit.Async.Deferred.prototype.toString = MochiKit.Base.forward("repr");

MochiKit.Async.Deferred.prototype._nextId = (function () {
    var x = 0;
    return function () {
        return ++x;
    }
})();

MochiKit.Async.Deferred.prototype.cancel = function () {
    /***

    Cancels a Deferred that has not yet received a value,
    or is waiting on another Deferred as its value.

    If a canceller is defined, the canceller is called.
    If the canceller did not return an error, or there
    was no canceller, then the errback chain is started
    with CancelledError.

    ***/
    if (this.fired == -1) {
        if (this.canceller) {
            this.canceller(this);
        } else {
            this.silentlyCancelled = true;
        }
        if (this.fired == -1) {
            this.errback(new MochiKit.Async.CancelledError(this));
        }
    } else if ((this.fired == 0) && (this.results[0] instanceof MochiKit.Async.Deferred)) {
        this.results[0].cancel();
    }
};
        

MochiKit.Async.Deferred.prototype._pause = function () {
    /***

    Used internally to signal that it's waiting on another Deferred

    ***/
    this.paused++;
};

MochiKit.Async.Deferred.prototype._unpause = function () {
    /***

    Used internally to signal that it's no longer waiting on another
    Deferred.

    ***/
    this.paused--;
    if ((this.paused == 0) && (this.fired >= 0)) {
        this._fire();
    }
};

MochiKit.Async.Deferred.prototype._continue = function (res) {
    /***

    Used internally when a dependent deferred fires.

    ***/
    this._resback(res);
    this._unpause();
};

MochiKit.Async.Deferred.prototype._resback = function (res) {
    /***

    The primitive that means either callback or errback

    ***/
    this.fired = ((res instanceof Error) ? 1 : 0);
    this.results[this.fired] = res;
    this._fire();
};

MochiKit.Async.Deferred.prototype._check = function () {
    if (this.fired != -1) {
        if (!this.silentlyCancelled) {
            throw new MochiKit.Async.AlreadyCalledError(this);
        }
        this.silentlyCancelled = false;
        return;
    }
};

MochiKit.Async.Deferred.prototype.callback = function (res) {
    /***

    Begin the callback sequence with a non-error value.
    
    callback or errback should only be called once
    on a given Deferred.

    ***/
    this._check();
    this._resback(res);
};

MochiKit.Async.Deferred.prototype.errback = function (res) {
    /***

    Begin the callback sequence with an error result.

    callback or errback should only be called once
    on a given Deferred.

    ***/
    this._check();
    if (!(res instanceof Error)) {
        res = new MochiKit.Async.GenericError(res);
    }
    this._resback(res);
};

MochiKit.Async.Deferred.prototype.addBoth = function (fn) {
    /***

    Add the same function as both a callback and an errback as the
    next element on the callback sequence.  This is useful for code
    that you want to guarantee to run, e.g. a finalizer.

    ***/
    return this.addCallbacks(fn, fn);
};

MochiKit.Async.Deferred.prototype.addCallback = function (fn) {
    /***

    Add a single callback to the end of the callback sequence.

    ***/
    return this.addCallbacks(fn, null);
};

MochiKit.Async.Deferred.prototype.addErrback = function (fn) {
    /***

    Add a single errback to the end of the callback sequence.

    ***/
    return this.addCallbacks(null, fn);
};

MochiKit.Async.Deferred.prototype.addCallbacks = function (cb, eb) {
    /***

    Add separate callback and errback to the end of the callback
    sequence.

    ***/
    this.chain.push([cb, eb])
    if (this.fired >= 0) {
        this._fire();
    }
    return this;
};

MochiKit.Async.Deferred.prototype._fire = function () {
    /***

    Used internally to exhaust the callback sequence when a result
    is available.

    ***/
    var chain = this.chain;
    var fired = this.fired;
    var res = this.results[fired];
    var self = this;
    var cb = null;
    while (chain.length > 0 && this.paused == 0) {
        // Array
        var pair = chain.shift();
        var f = pair[fired];
        if (f == null) {
            continue;
        }
        try {
            res = f(res);
            fired = ((res instanceof Error) ? 1 : 0);
            if (res instanceof MochiKit.Async.Deferred) {
                cb = function (res) {
                    self._continue(res);
                }
                this._pause();
            }
        } catch (err) {
            fired = 1;
            res = err;
        }
    }
    this.fired = fired;
    this.results[fired] = res;
    if (cb && this.paused) {
        // this is for "tail recursion" in case the dependent deferred
        // is already fired
        res.addBoth(cb);
    }
};

MochiKit.Async.evalJSONRequest = function (req) {
    /***

    Evaluate a JSON (JavaScript Object Notation) XMLHttpRequest

    @param req: The request whose responseText is to be evaluated

    @rtype: L{Object}

    ***/
    return eval('(' + req.responseText + ')');
};

MochiKit.Async.succeed = function (/* optional */result) {
    /***

    Return a Deferred that has already had '.callback(result)' called.

    This is useful when you're writing synchronous code to an asynchronous
    interface: i.e., some code is calling you expecting a Deferred result,
    but you don't actually need to do anything asynchronous.  Just return
    succeed(theResult).

    See L{fail} for a version of this function that uses a failing Deferred
    rather than a successful one.

    @param result: The result to give to the Deferred's 'callback' method.

    @rtype: L{Deferred}

    ***/
    var d = new MochiKit.Async.Deferred();
    d.callback.apply(d, arguments);
    return d;
};

MochiKit.Async.fail = function (/* optional */result) {
    /***

    Return a Deferred that has already had '.errback(result)' called.

    See L{succeed}'s docstring for rationale.

    @param result: The same argument that L{Deferred.errback} takes.

    @rtype: L{Deferred}

    ***/
    var d = new MochiKit.Async.Deferred();
    d.errback.apply(d, arguments);
    return d;
};

MochiKit.Async.getXMLHttpRequest = function () {
    var self = arguments.callee;
    if (!self.XMLHttpRequest) {
        var tryThese = [
            function () { return new XMLHttpRequest(); },
            function () { return new ActiveXObject('Msxml2.XMLHTTP'); },
            function () { return new ActiveXObject('Microsoft.XMLHTTP'); },
            function () { return new ActiveXObject('Msxml2.XMLHTTP.4.0'); },
            function () {
                throw new MochiKit.Async.BrowserComplianceError("Browser does not support XMLHttpRequest");
            }
        ];
        for (var i = 0; i < tryThese.length; i++) {
            var func = tryThese[i];
            try {
                self.XMLHttpRequest = func;
                return func();
            } catch (e) {
                // pass
            }
        }
    }
    return self.XMLHttpRequest();
};

MochiKit.Async.sendXMLHttpRequest = function (req, /* optional */ sendContent) {
    if (typeof(sendContent) == 'undefined') {
        send = null;
    }

    var canceller = function () {
        // IE SUCKS
        try {
            req.onreadystatechange = null;
        } catch (e) {
            try {
                req.onreadystatechange = function () {};
            } catch (e) {
            }
        }
        req.abort();
    }

    var d = new MochiKit.Async.Deferred(canceller);
    
    var onreadystatechange = function () {
        // MochiKit.Logging.logDebug('req.readyState', req.readyState);
        if (req.readyState == 4) {
            // IE SUCKS
            try {
                req.onreadystatechange = null;
            } catch (e) {
                try {
                    req.onreadystatechange = function () {};
                } catch (e) {
                }
            }
            var status = null;
            try {
                status = req.status;
                if (!status && MochiKit.Base.isNotEmpty(req.responseText)) {
                    // 0 or undefined seems to mean cached or local
                    status = 304;
                }
            } catch (e) {
                // pass
                // MochiKit.Logging.logDebug('error getting status?', repr(items(e)));
            }
            //  200 is OK, 304 is NOT_MODIFIED
            if (status == 200 || status == 304) { // OK
                d.callback(req);
            } else {
                var err = new MochiKit.Async.XMLHttpRequestError(req, "Request failed");
                if (err.number) {
                    // XXX: This seems to happen on page change
                    d.errback(err);
                } else {
                    // MochiKit.Logging.logDebug("Ignoring XMLHttpRequest, undefined status");
                }
            }
        }
    }
    try {
        req.onreadystatechange = onreadystatechange;
        req.send(sendContent);
    } catch (e) {
        try {
            req.onreadystatechange = null;
        } catch (ignore) {
            // pass
        }
        d.errback(e);
    }

    return d;

}

MochiKit.Async.doSimpleXMLHttpRequest = function (url) {
    var req = MochiKit.Async.getXMLHttpRequest();
    req.open("GET", url, true);
    return MochiKit.Async.sendXMLHttpRequest(req);
};

MochiKit.Async.loadJSONDoc = function (url) {
    /***

    Do a simple XMLHttpRequest to a URL and get the response
    as a JSON document.

    @param url: The URL to GET

    @rtype: L{Deferred} returning the evaluated JSON response

    ***/

    var d = MochiKit.Async.doSimpleXMLHttpRequest(url);
    d = d.addCallback(MochiKit.Async.evalJSONRequest);
    return d;
};

MochiKit.Async.wait = function (seconds, /* optional */value) {
    var d = new MochiKit.Async.Deferred();
    var bind = MochiKit.Base.bind;
    var partial = MochiKit.Base.partial;
    if (typeof(value) != 'undefined') {
        d.addCallback(function () { return value; });
    }
    var timeout = setTimeout(bind(d.callback, d), Math.floor(seconds * 1000));
    d.canceller = partial(clearTimeout, timeout);
    return d;
};

MochiKit.Async.callLater = function (seconds, func) {
    var m = MochiKit.Base;
    var func = m.partial.apply(null, m.extend(null, arguments, 1));
    return MochiKit.Async.wait(seconds).addCallback(
        function (res) { return func(); }
    );
};

MochiKit.Async.EXPORT = [
    "AlreadyCalledError",
    "CancelledError",
    "BrowserComplianceError",
    "GenericError",
    "XMLHttpRequestError",
    "Deferred",
    "succeed",
    "fail",
    "getXMLHttpRequest",
    "doSimpleXMLHttpRequest",
    "loadJSONDoc",
    "wait",
    "callLater",
    "sendXMLHttpRequest"
];
    
MochiKit.Async.EXPORT_OK = [
    "evalJSONRequest"
];

MochiKit.Async.__new__ = function () {

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": MochiKit.Base.concat(this.EXPORT, this.EXPORT_OK)
    };

    MochiKit.Base.nameFunctions(this);

};

MochiKit.Async.__new__();

if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Async);
}
