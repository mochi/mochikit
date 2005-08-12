/***

MochiKit.Logging 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Logging');
    dojo.require('MochiKit.Base');
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base", []);
}

try {
    if (typeof(MochiKit.Base) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.Logging depends on MochiKit.Base!";
}

if (typeof(MochiKit.Logging) == 'undefined') {
    MochiKit.Logging = {};
}

MochiKit.Logging.NAME = "MochiKit.Logging";
MochiKit.Logging.VERSION = "0.80";
MochiKit.Logging.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

MochiKit.Logging.toString = function () {
    return this.__repr__();
};


MochiKit.Logging.EXPORT = [
    "LogLevel",
    "LogMessage",
    "Logger",
    "alertListener",
    "logger",
    "log",
    "logError",
    "logDebug",
    "logFatal",
    "logWarning"
];


MochiKit.Logging.EXPORT_OK = [
    "logLevelAtLeast",
    "isLogMessage",
    "compareLogMessage"
];


MochiKit.Logging.logLevelAtLeast = function (minLevel) {
    /***

        Return a function that will match log messages whose level
        is at least minLevel

    ***/
    if (typeof(minLevel) == 'string') {
        minLevel = MochiKit.Logging.LogLevel[minLevel];
    }
    return function (msg) {
        var msgLevel = msg.level;
        if (typeof(msgLevel) == 'string') {
            msgLevel = MochiKit.Logging.LogLevel[msgLevel];
        }
        return msgLevel >= minLevel;
    }
};

MochiKit.Logging.LogMessage = function (num, level, info) {
    this.num = num;
    this.level = level;
    this.info = info;
    this.timestamp = new Date();
};

MochiKit.Logging.LogMessage.prototype.repr = function () {
    return 'LogMessage(' + 
        MochiKit.Base.map(
            MochiKit.Base.repr,
            [this.num, this.level, this.info]
        ).join(', ') + ')';
};

MochiKit.Logging.LogMessage.prototype.toString = function () {
    return this.repr();
};

MochiKit.Logging.isLogMessage = function (/* ... */) {
    var LogMessage = MochiKit.Logging.LogMessage;
    for (var i = 0; i < arguments.length; i++) {
        if (!(arguments[i] instanceof LogMessage)) {
            return false;
        }
    }
    return true;
};

MochiKit.Logging.compareLogMessage = function (a, b) {
    return MochiKit.Base.compare([a.level, a.info], [b.level, b.info]);
};

MochiKit.Logging.Logger = function (/* optional */maxSize) {
    /***

        A basic logger object that has a buffer of recent messages
        plus a listener dispatch mechanism for "real-time" logging
        of important messages

        maxSize is the maximum number of entries in the log.
        If maxSize >= 0, then the log will not buffer more than that
        many messages.

        There is a default logger available named "logger", and several
        of its methods are also global functions:

            logger.log      -> log
            logger.debug    -> logDebug
            logger.warning  -> logWarning
            logger.error    -> logError
            logger.fatal    -> logFatal
        
    ***/
    this.counter = 0;
    if (typeof(maxSize) == 'undefined' || maxSize == null) {
        maxSize = -1;
    }
    this.maxSize = maxSize;
    this._messages = [];
    this.listeners = {};
};

MochiKit.Logging.Logger.prototype.clear = function () {
    /***

        Clear all messages from the message buffer.

    ***/
    this._messages.splice(0, this._messages.length);
};

MochiKit.Logging.Logger.prototype.dispatchListeners = function (msg) {
    /***

        Dispatch a log message to all listeners.

    ***/
    for (var k in this.listeners) {
        var pair = this.listeners[k];
        if (pair[0] && !pair[0](msg)) {
            continue;
        }
        pair[1](msg);
    }
};

MochiKit.Logging.Logger.prototype.addListener = function (ident, filter, listener) {
    /***

        Add a listener for log messages.
        
        ident is a unique identifier that may be used to remove the listener
        later on.
        
        filter can be one of the following:
            null:
                listener(msg) will be called for every log message
                received.

            string:
                logLevelAtLeast(filter) will be used as the function
                (see below).

            function:
                filter(msg) will be called for every msg, if it returns
                true then listener(msg) will be called.

        listener is a function that takes one argument, a log message.  A log
        message has three properties:

            num:
                A counter that uniquely identifies a log message (per-logger)

            level:
                A string or number representing the log level.  If string, you
                may want to use LogLevel[level] for comparison.
            
            info:
                A list of objects passed as arguments to the log function.

    ***/
            
            
    if (typeof(filter) == 'string') {
        filter = MochiKit.Logging.logLevelAtLeast(filter);
    }
    this.listeners[ident] = [filter, listener];
};

MochiKit.Logging.Logger.prototype.removeListener = function (ident) {
    /***

        Remove a listener using the ident given to addListener

    ***/
    delete this.listeners[ident];
};

MochiKit.Logging.Logger.prototype.baseLog = function (level, message/*, ...*/) {
    /***

        The base functionality behind all of the log functions.
        The first argument is the log level as a string or number,
        and all other arguments are used as the info list.

        This function is available partially applied as:

            Logger.debug    'DEBUG'
            Logger.log      'INFO'
            Logger.error    'ERROR'
            Logger.fatal    'FATAL'
            Logger.warning  'WARNING'

        For the default logger, these are also available as global functions,
        see the Logger constructor documentation for more info.

    ***/
            
    var msg = new MochiKit.Logging.LogMessage(
        this.counter,
        level,
        MochiKit.Base.extend(null, arguments, 1)
    );
    this._messages.push(msg);
    this.dispatchListeners(msg);
    this.counter += 1;
    while (this.maxSize >= 0 && this._messages.length > this.maxSize) {
        this._messges.shift();
    }
};

MochiKit.Logging.Logger.prototype.getMessages = function (howMany) {
    /***

        Return a list of up to howMany messages from the message buffer.

    ***/
    var firstMsg = 0;
    if (!(typeof(howMany) == 'undefined' || howMany == null)) {
        firstMsg = Math.max(0, this._messages.length - howMany);
    }
    return this._messages.slice(firstMsg);
};

MochiKit.Logging.Logger.prototype.getMessageText = function (howMany) {
    /***

        Get a string representing up to the last howMany messages in the
        message buffer.  The default is 30.

        The message looks like this:

            LAST {messages.length} MESSAGES:
              [{msg.num}] {msg.level}: {m.info.join(' ')}
              [{msg.num}] {msg.level}: {m.info.join(' ')}
              ...

        If you want some other format, use Logger.getMessages and do it
        yourself.

    ***/
    if (typeof(howMany) == 'undefined' || howMany == null) {
        howMany = 30;
    }
    var messages = this.getMessages(howMany);
    if (messages.length) {
        var lst = map(function (m) {
            return '\n  [' + m.num + '] ' + m.level + ': ' + m.info.join(' '); 
        }, messages);
        lst.unshift('LAST ' + messages.length + ' MESSAGES:');
        return lst.join('');
    }
    return '';
};

MochiKit.Logging.Logger.prototype.debuggingBookmarklet = function () {
    alert(this.getMessageText());
};

MochiKit.Logging.alertListener = function (msg) {
    /***

    Ultra-obnoxious alert(...) listener

    ***/
    alert(
        "num: " + msg.num +
        "\nlevel: " +  msg.level +
        "\ninfo: " + msg.info.join(" ")
    );
};

MochiKit.Logging.__new__ = function () {
    this.LogLevel = {
        'ERROR': 40,
        'FATAL': 50,
        'WARNING': 30,
        'INFO': 20,
        'DEBUG': 10
    };

    MochiKit.Base.registerComparator("LogMessage",
        this.isLogMessage,
        this.compareLogMessage
    );

    var partial = MochiKit.Base.partial;

    var Logger = this.Logger;
    Logger.prototype.debug = partial(Logger.prototype.baseLog, 'DEBUG');
    Logger.prototype.log = partial(Logger.prototype.baseLog, 'INFO');
    Logger.prototype.error = partial(Logger.prototype.baseLog, 'ERROR');
    Logger.prototype.fatal = partial(Logger.prototype.baseLog, 'FATAL');
    Logger.prototype.warning = partial(Logger.prototype.baseLog, 'WARNING');

    // indirectly find logger so it can be replaced
    var self = this;
    var connectLog = function (name) {
        return function () {
            self.logger[name].apply(self.logger, arguments);
        }
    };

    this.log = connectLog('log');
    this.logError = connectLog('error');
    this.logDebug = connectLog('debug');
    this.logFatal = connectLog('fatal');
    this.logWarning = connectLog('warning');
    this.logger = new Logger();

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": MochiKit.Base.concat(this.EXPORT, this.EXPORT_OK)
    };

    MochiKit.Base.nameFunctions(this);

};

MochiKit.Logging.__new__();

if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Logging);
}
