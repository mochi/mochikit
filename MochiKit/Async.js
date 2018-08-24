/***

MochiKit.Async 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
MochiKit.Base.module(MochiKit, 'Async', '1.5', ['Base']);
MochiKit.Base.update(MochiKit.Async, {
    /** @id MochiKit.Async.wait */
});


/** @id MochiKit.Async.maybeDeferred */
MochiKit.Async.maybeDeferred = function (func) {
    var self = MochiKit.Async;
    var result;
    try {
        var r = func.apply(null, MochiKit.Base.extend([], arguments, 1));
        if (r instanceof self.Deferred) {
            result = r;
        } else if (r instanceof Error) {
            result = self.fail(r);
        } else {
            result = self.succeed(r);
        }
    } catch (e) {
        result = self.fail(e);
    }
    return result;
};


MochiKit.Async.__new__ = function () {
    var m = MochiKit.Base;
    var ne = m.partial(m._newNamedError, this);

    ne("AlreadyCalledError",
        /** @id MochiKit.Async.AlreadyCalledError */
        function (deferred) {
            /***

            Raised by the Deferred if callback or errback happens
            after it was already fired.

            ***/
            this.deferred = deferred;
        }
    );

    ne("CancelledError",
        /** @id MochiKit.Async.CancelledError */
        function (deferred) {
            /***

            Raised by the Deferred cancellation mechanism.

            ***/
            this.deferred = deferred;
        }
    );

    ne("BrowserComplianceError",
        /** @id MochiKit.Async.BrowserComplianceError */
        function (msg) {
            /***

            Raised when the JavaScript runtime is not capable of performing
            the given function.  Technically, this should really never be
            raised because a non-conforming JavaScript runtime probably
            isn't going to support exceptions in the first place.

            ***/
            this.message = msg;
        }
    );

    ne("GenericError",
        /** @id MochiKit.Async.GenericError */
        function (msg) {
            this.message = msg;
        }
    );

    ne("XMLHttpRequestError",
        /** @id MochiKit.Async.XMLHttpRequestError */
        function (req, msg) {
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
        }
    );

    m.nameFunctions(this);
};

MochiKit.Async.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Async);
