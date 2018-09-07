/***

MochiKit.Logging 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

MochiKit.Base.module(MochiKit, 'Logging', '1.5', ['Base']);

    /** @id MochiKit.Logging.LogMessage */
MochiKit.Logging.LogMessage = function (num, level, info) {
    this.num = num;
    this.level = level;
    this.info = info;
    this.timestamp = new Date();
};

MochiKit.Base.update(MochiKit.Logging, {
    /** @id MochiKit.Logging.logLevelAtLeast */
    logLevelAtLeast: function (minLevel) {
        var self = MochiKit.Logging;
        if (typeof(minLevel) == 'string') {
            minLevel = self.LogLevel[minLevel];
        }
        return function (msg) {
            var msgLevel = msg.level;
            if (typeof(msgLevel) == 'string') {
                msgLevel = self.LogLevel[msgLevel];
            }
            return msgLevel >= minLevel;
        };
    },

    /** @id MochiKit.Logging.compareLogMessage */
    compareLogMessage: function (a, b) {
        return MochiKit.Base.compare([a.level, a.info], [b.level, b.info]);
    },
});

/** @id MochiKit.Logging.Logger */
MochiKit.Logging.Logger = function (/* optional */maxSize) {
    this.counter = 0;
    if (typeof(maxSize) == 'undefined' || maxSize === null) {
        maxSize = -1;
    }
    this.maxSize = maxSize;
    this._messages = [];
    this.listeners = {};
    this.useNativeConsole = false;
};

MochiKit.Logging.Logger.prototype = {
    /** @id MochiKit.Logging.Logger.prototype.getMessageText */
    getMessageText: function (howMany) {
        if (typeof(howMany) == 'undefined' || howMany === null) {
            howMany = 30;
        }
        var messages = this.getMessages(howMany);
        if (messages.length) {
            var lst = MochiKit.Base.map(function (m) {
                return '\n  [' + m.num + '] ' + m.level + ': ' + m.info.join(' ');
            }, messages);
            lst.unshift('LAST ' + messages.length + ' MESSAGES:');
            return lst.join('');
        }
        return '';
    },

    /** @id MochiKit.Logging.Logger.prototype.debuggingBookmarklet */
    debuggingBookmarklet: function (inline) {
        if (typeof(MochiKit.LoggingPane) == "undefined") {
            alert(this.getMessageText());
        } else {
            MochiKit.LoggingPane.createLoggingPane(inline || false);
        }
    }
};

MochiKit.Logging.__new__ = function () {
    this.LogLevel = {
        ERROR: 40,
        FATAL: 50,
        WARNING: 30,
        INFO: 20,
        DEBUG: 10
    };

    var m = MochiKit.Base;
    m.registerComparator("LogMessage",
        this.isLogMessage,
        this.compareLogMessage
    );

    var partial = m.partial;

    var Logger = this.Logger;
    var baseLog = Logger.prototype.baseLog;
    m.update(this.Logger.prototype, {
        debug: partial(baseLog, 'DEBUG'),
        log: partial(baseLog, 'INFO'),
        error: partial(baseLog, 'ERROR'),
        fatal: partial(baseLog, 'FATAL'),
        warning: partial(baseLog, 'WARNING')
    });

    // indirectly find logger so it can be replaced
    var self = this;
    var connectLog = function (name) {
        return function () {
            self.logger[name].apply(self.logger, arguments);
        };
    };

    /** @id MochiKit.Logging.log */
    this.log = connectLog('log');
    /** @id MochiKit.Logging.logError */
    this.logError = connectLog('error');
    /** @id MochiKit.Logging.logDebug */
    this.logDebug = connectLog('debug');
    /** @id MochiKit.Logging.logFatal */
    this.logFatal = connectLog('fatal');
    /** @id MochiKit.Logging.logWarning */
    this.logWarning = connectLog('warning');
    this.logger = new Logger();
    this.logger.useNativeConsole = true;

    m.nameFunctions(this);
};

MochiKit.Logging.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Logging);
