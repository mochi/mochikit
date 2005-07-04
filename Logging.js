LogLevel = {
    'ERROR': 40,
    'FATAL': 50,
    'WARNING': 30,
    'INFO': 20,
    'DEBUG': 10
}

logLevelAtLeast = function (minLevel) {
    /***

        Return a function that will match log messages whose level
        is at least minLevel

    ***/
    if (typeof(minLevel) == 'string') {
        minLevel = LogLevel[minLevel];
    }
    return function (msg) {
        var msgLevel = msg.level;
        if (typeof(msgLevel) == 'string') {
            msgLevel = LogLevel[msgLevel];
        }
        return msgLevel >= minLevel;
    }
}

LogMessage = function (num, level, info) {
    this.num = num;
    this.level = level;
    this.info = info;
    this.timestamp = new Date();
}
LogMessage.prototype.repr = function () {
    return 'LogMessage(' + map(repr, [this.num, this.level, this.info]).join(', ') + ')';
}
LogMessage.prototype.toString = forward("repr");

registerComparator("LogMessage",
    function (a, b) {
        return (a instanceof LogMessage) && (b instanceof LogMessage);
    },
    function (a, b) {
        return compare([a.level, a.info], [b.level, b.info]);
    }
);


Logger = function (/* optional */maxSize) {
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
    if (isUndefinedOrNull(maxSize)) {
        maxSize = -1;
    }
    this.maxSize = maxSize;
    this._messages = [];
    this.listeners = {};
}

Logger.prototype.clear = function () {
    /***

        Clear all messages from the message buffer.

    ***/
    this._messages.splice(0, this._messages.length);
}

Logger.prototype.dispatchListeners = function (msg) {
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
}

Logger.prototype.addListener = function (ident, filter, listener) {
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
        filter = logLevelAtLeast(filter);
    }
    this.listeners[ident] = [filter, listener];
}

Logger.prototype.removeListener = function (ident) {
    /***

        Remove a listener using the ident given to addListener

    ***/
    delete this.listeners[ident];
}

Logger.prototype.baseLog = function (level, message/*, ...*/) {
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
            
    var msg = new LogMessage(this.counter, level, extend(null, arguments, 1));
    this._messages.push(msg);
    this.dispatchListeners(msg);
    this.counter += 1;
    while (this.maxSize >= 0 && this._messages.length > this.maxSize) {
        this._messges.shift();
    }
}

Logger.prototype.debug = partial(Logger.prototype.baseLog, 'DEBUG');
Logger.prototype.log = partial(Logger.prototype.baseLog, 'INFO');
Logger.prototype.error = partial(Logger.prototype.baseLog, 'ERROR');
Logger.prototype.fatal = partial(Logger.prototype.baseLog, 'FATAL');
Logger.prototype.warning = partial(Logger.prototype.baseLog, 'WARNING');

Logger.prototype.getMessages = function (howMany) {
    /***

        Return a list of up to howMany messages from the message buffer.

    ***/
    var firstMsg = 0;
    if (!isUndefinedOrNull(howMany)) {
        firstMsg = Math.max(0, this._messages.length - howMany - 1);
    }
    return this._messages.slice(firstMsg);
}

Logger.prototype.getMessageText = function (howMany) {
    /***

        Get a string representing up to the last howMany messages in the
        message buffer.  The default is 40.

        The message looks like this:

            LAST {messages.length} MESSAGES:
              [{msg.num}] {msg.level}: {m.info.join(' ')}
              [{msg.num}] {msg.level}: {m.info.join(' ')}
              ...

        If you want some other format, use Logger.getMessages and do it
        yourself.

    ***/
    if (isUndefinedOrNull(howMany)) {
        howMany = 40;
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
}

Logger.prototype.debuggingBookmarklet = function () {
    alert(this.getMessageText());
}

alertListener = function (msg) {
    /***

    Ultra-obnoxious alert(...) listener

    ***/
    alert(
        "num: " + msg.num +
        "\nlevel: " +  msg.level +
        "\ninfo: " + msg.info.join(" ")
    );
}

logger = new Logger();
log = bind(logger.log, logger);
logError = bind(logger.error, logger);
logDebug = bind(logger.debug, logger);
logFatal = bind(logger.fatal, logger);
logWarning = bind(logger.warning, logger);
