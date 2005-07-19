.. -*- mode: rst -*-

MochiKit.Logging
================

Constructors
------------

LogMessage(num, level, info):

    Properties:

        num:
            Identifier for the log message

        level:
            Level of the log message
        
        info:
            All other arguments passed to log function as an Array

        timestamp:
            Date object timestamping the log message

Logger([maxSize]):

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

Logger.prototype.clear():
    Clear all messages from the message buffer.

Logger.prototype.dispatchListeners(msg):
    Dispatch a log message to all listeners.

Logger.prototype.addListener(ident, filter, listener):
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

Logger.prototype.removeListener(ident):
    Remove a listener using the ident given to addListener

Logger.prototype.baseLog(level, message[, ...]):
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

Logger.prototype.getMessages(howMany):
    Return a list of up to howMany messages from the message buffer.

Logger.prototype.getMessageText(howMany):
    Get a string representing up to the last howMany messages in the
    message buffer.  The default is 30.

    The message looks like this:

        LAST {messages.length} MESSAGES:
          [{msg.num}] {msg.level}: {m.info.join(' ')}
          [{msg.num}] {msg.level}: {m.info.join(' ')}
          ...

    If you want some other format, use Logger.getMessages and do it
    yourself.

Logger.prototype.debuggingBookmarklet():
    Pop up the contents of the logger in a useful way for browsers,
    currently just an alert with this.getMessageText().  The idea is to
    make it smarter at some point, and this method allows us to do that
    without changing any bookmarklets.

Functions
---------

logLevelAtLeast(minLevel):
    Return a function that will match log messages whose level
    is at least minLevel

alertListener(msg):
    Ultra-obnoxious alert(...) listener

debug(message[, info[, ...]]):
    Log DEBUG message to the default logger

warning(message[, info[, ...]]):
    Log a WARNING message to the default logger

error(message[, info[, ...]]):
    Log an ERROR message to the default logger

fatal(message[, info[, ...]]):
    Log a FATAL message to the default logger
