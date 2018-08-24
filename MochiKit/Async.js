/***

MochiKit.Async 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
MochiKit.Base.module(MochiKit, 'Async', '1.5', ['Base']);
MochiKit.Base.update(MochiKit.Async, {

    /** @id MochiKit.Async.succeed */
    succeed: function (/* optional */result) {
        var d = new MochiKit.Async.Deferred();
        d.callback.apply(d, arguments);
        return d;
    },

    /** @id MochiKit.Async.fail */
    fail: function (/* optional */result) {
        var d = new MochiKit.Async.Deferred();
        d.errback.apply(d, arguments);
        return d;
    },


    /** @id MochiKit.Async.sendXMLHttpRequest */
    sendXMLHttpRequest: function (req, /* optional */ sendContent) {
        if (typeof(sendContent) == "undefined" || sendContent === null) {
            sendContent = "";
        }

        var m = MochiKit.Base;
        var self = MochiKit.Async;
        var d = new self.Deferred(m.partial(self._xhr_canceller, req));

        try {
            req.onreadystatechange = m.bind(self._xhr_onreadystatechange,
                req, d);
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

    },

    /** @id MochiKit.Async.doXHR */
    doXHR: function (url, opts) {
        /*
            Work around a Firefox bug by dealing with XHR during
            the next event loop iteration. Maybe it's this one:
            https://bugzilla.mozilla.org/show_bug.cgi?id=249843
        */
        var self = MochiKit.Async;
        return self.callLater(0, self._doXHR, url, opts);
    },

    _doXHR: function (url, opts) {
        var m = MochiKit.Base;
        opts = m.update({
            method: 'GET',
            sendContent: ''
            /*
            queryString: undefined,
            username: undefined,
            password: undefined,
            headers: undefined,
            mimeType: undefined,
            responseType: undefined,
            withCredentials: undefined
            */
        }, opts);
        var self = MochiKit.Async;
        var req = self.getXMLHttpRequest();
        if (opts.queryString) {
            var qs = m.queryString(opts.queryString);
            if (qs) {
                url += "?" + qs;
            }
        }
        // Safari will send undefined:undefined, so we have to check.
        // We can't use apply, since the function is native.
        if ('username' in opts) {
            req.open(opts.method, url, true, opts.username, opts.password);
        } else {
            req.open(opts.method, url, true);
        }
        if (req.overrideMimeType && opts.mimeType) {
            req.overrideMimeType(opts.mimeType);
        }
        req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        if (opts.headers) {
            var headers = opts.headers;
            if (!m.isArrayLike(headers)) {
                headers = m.items(headers);
            }
            for (var i = 0; i < headers.length; i++) {
                var header = headers[i];
                var name = header[0];
                var value = header[1];
                req.setRequestHeader(name, value);
            }
        }
        if ("responseType" in opts && "responseType" in req) {
            req.responseType = opts.responseType;
        }
        if (opts.withCredentials) {
            req.withCredentials = 'true';
        }
        return self.sendXMLHttpRequest(req, opts.sendContent);
    },

    _buildURL: function (url/*, ...*/) {
        if (arguments.length > 1) {
            var m = MochiKit.Base;
            var qs = m.queryString.apply(null, m.extend(null, arguments, 1));
            if (qs) {
                return url + "?" + qs;
            }
        }
        return url;
    },

    /** @id MochiKit.Async.doSimpleXMLHttpRequest */
    doSimpleXMLHttpRequest: function (url/*, ...*/) {
        var self = MochiKit.Async;
        url = self._buildURL.apply(self, arguments);
        return self.doXHR(url);
    },

    /** @id MochiKit.Async.loadJSONDoc */
    loadJSONDoc: function (url/*, ...*/) {
        var self = MochiKit.Async;
        url = self._buildURL.apply(self, arguments);
        var d = self.doXHR(url, {
            'mimeType': 'text/plain',
            'headers': [['Accept', 'application/json']]
        });
        d = d.addCallback(self.evalJSONRequest);
        return d;
    },

    /** @id MochiKit.Async.wait */
    wait: function (seconds, /* optional */value) {
        var d = new MochiKit.Async.Deferred();
        var cb = MochiKit.Base.bind("callback", d, value);
        var timeout = setTimeout(cb, Math.floor(seconds * 1000));
        d.canceller = function () {
            try {
                clearTimeout(timeout);
            } catch (e) {
                // pass
            }
        };
        return d;
    },

    /** @id MochiKit.Async.callLater */
    callLater: function (seconds, func) {
        var m = MochiKit.Base;
        var pfunc = m.partial.apply(m, m.extend(null, arguments, 1));
        return MochiKit.Async.wait(seconds).addCallback(
            function (res) { return pfunc(); }
        );
    }
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
