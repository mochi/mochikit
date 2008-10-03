.. title:: MochiKit.Logging - we're all tired of alert()

Name
====

MochiKit.Logging - we're all tired of alert()


Synopsis
========

::

    log("INFO messages are so boring");
    logDebug("DEBUG messages are even worse");
    log("good thing I can pass", objects, "conveniently");


Description
===========

MochiKit.Logging steals some ideas from Python's logging module [1]_,
but completely forgot about the Java [2]_ inspiration. This is a KISS
module for logging that provides enough flexibility to do just about
anything via listeners, but without all the cruft.


Dependencies
============

- :mochiref:`MochiKit.Base`


Overview
========

Native Console Logging
----------------------

As of MochiKit 1.3, the default logger will log all messages to your
browser's native console. This is currently supported in Safari, Opera
9, and Firefox when the `FireBug`_ extension is installed. MochiKit
1.4 adds support for the relevant APIs for Internet Explorer (the
Debugger and the Atlas framework, see `here`__).

.. __: http://www.nikhilk.net/Entry.aspx?id=93
.. _`FireBug`: http://www.joehewitt.com/software/firebug/

To disable this behavior::

    MochiKit.Logging.logger.useNativeConsole = false;


Bookmarklet Based Debugging
---------------------------

JavaScript is at a serious disadvantage without a standard console for
"print" statements. Everything else has one. The closest thing that
you get in a browser environment is the ``alert`` function, which is
absolutely evil.

This leaves you with one reasonable solution: do your logging in the
page somehow. The problem here is that you don't want to clutter the
page with debugging tools. The solution to that problem is what we
call BBD, or Bookmarklet Based Debugging [3]_.

Simply create a bookmarklet for
`javascript:MochiKit.Logging.logger.debuggingBookmarklet()`__, and
whack it whenever you want to see what's in the logger. Of course,
this means you must drink the MochiKit.Logging kool-aid. It's tangy
and sweet, don't worry.

.. __: javascript:MochiKit.Logging.logger.debuggingBookmarklet()

Currently this uses :mochiref:`MochiKit.LoggingPane` if loaded and
otherwise falls back to ugly ``alert`` messages.


API Reference
=============

Constructors
------------

:mochidef:`LogMessage(num, level, info)`:

    Properties:

        ``num``:
            Identifier for the log message

        ``level``:
            Level of the log message (``"INFO"``, ``"WARN"``,
            ``"DEBUG"``, etc.)

        ``info``:
            All other arguments passed to log function as an ``Array``

        ``timestamp``:
            ``Date`` object timestamping the log message

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger([maxSize])`:

    A basic logger object that has a buffer of recent messages plus a
    listener dispatch mechanism for "real-time" logging of important
    messages.

    ``maxSize`` is the maximum number of entries in the log.  If
    ``maxSize >= 0``, then the log will not buffer more than that many
    messages. So if you don't like logging at all, be sure to pass
    ``0``.

    There is a default logger available named "logger", and several of
    its methods are also global functions:

        ==================  =============
        ``logger.log``      -> :mochiref:`log`
        ``logger.debug``    -> :mochiref:`logDebug`
        ``logger.warning``  -> :mochiref:`logWarning`
        ``logger.error``    -> :mochiref:`logError`
        ``logger.fatal``    -> :mochiref:`logFatal`
        ==================  =============

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.addListener(ident, filter, listener)`:

    Add a listener for log messages.

    ``ident`` is a unique identifier that may be used to remove the
    listener later on.

    ``filter`` can be one of the following:

        ``null``:
            ``listener(msg)`` will be called for every log message
            received.

        ``string``:
            :mochiref:`logLevelAtLeast(filter)` will be used as the
            function (see below).

        ``function``:
            ``filter(msg)`` will be called for every msg, if it
            returns true then ``listener(msg)`` will be called.

    ``listener`` is a function that takes one argument, a log
    message. A log message is an object (:mochiref:`LogMessage`
    instance) that has at least these properties:

        ``num``:
            A counter that uniquely identifies a log message
            (per-logger)

        ``level``:
            A string or number representing the log level. If string,
            you may want to use ``LogLevel[level]`` for comparison.

        ``info``:
            An Array of objects passed as additional arguments to the
            ``log`` function.

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.baseLog(level, message[, ...])`:

    The base functionality behind all of the log functions.  The first
    argument is the log level as a string or number, and all other
    arguments are used as the info list.

    This function is available partially applied as:

        ==============  =========
        Logger.debug    'DEBUG'
        Logger.log      'INFO'
        Logger.error    'ERROR'
        Logger.fatal    'FATAL'
        Logger.warning  'WARNING'
        ==============  =========

    For the default logger, these are also available as global
    functions, see the :mochiref:`Logger` constructor documentation
    for more info.

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.clear()`:

    Clear all messages from the message buffer.

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.debuggingBookmarklet()`:

    Display the contents of the logger in a useful way for browsers.

    Currently, if :mochiref:`MochiKit.LoggingPane` is loaded, then a
    pop-up :mochiref:`MochiKit.LoggingPane.LoggingPane` will be
    used. Otherwise, it will be an alert with
    :mochiref:`Logger.prototype.getMessageText()`.

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.dispatchListeners(msg)`:

    Dispatch a log message to all listeners.

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.getMessages([howMany])`:

    Returns a list of messages from the message buffer, ordered
    from the oldest to the newest message. If ``howMany`` is
    specified, only the last ``howMany`` messages are returned.
    Otherwise all messages in the buffer are returned.

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.getMessageText([howMany])`:

    Get a string representing up to the last ``howMany`` messages in
    the message buffer. The default is ``30``.

    The message looks like this::

        LAST {messages.length} MESSAGES:
          [{msg.num}] {msg.level}: {m.info.join(' ')}
          [{msg.num}] {msg.level}: {m.info.join(' ')}
          ...

    If you want some other format, use
    :mochiref:`Logger.prototype.getMessages` and do it yourself.

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`Logger.prototype.removeListener(ident)`:

    Remove a listener using the ident given to
    :mochiref:`Logger.prototype.addListener`

    *Availability*:
        Available in MochiKit 1.3.1+


Functions
---------

:mochidef:`alertListener(msg)`:

    Ultra-obnoxious ``alert(...)`` listener

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`log(message[, info[, ...]])`:

    Log an INFO message to the default logger

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`logDebug(message[, info[, ...]])`:

    Log a DEBUG message to the default logger

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`logError(message[, info[, ...]])`:

    Log an ERROR message to the default logger

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`logFatal(message[, info[, ...]])`:

    Log a FATAL message to the default logger

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`logLevelAtLeast(minLevel)`:

    Return a function that will match log messages whose level is at
    least minLevel

    *Availability*:
        Available in MochiKit 1.3.1+


:mochidef:`logWarning(message[, info[, ...]])`:

    Log a WARNING message to the default logger

    *Availability*:
        Available in MochiKit 1.3.1+


See Also
========

.. [1] Python's logging module: http://docs.python.org/lib/module-logging.html
.. [2] PEP 282, where they admit all of the Java influence: http://www.python.org/peps/pep-0282.html
.. [3] Original Bookmarklet Based Debugging blather: http://bob.pythonmac.org/archives/2005/07/03/bookmarklet-based-debugging/


Authors
=======

- Bob Ippolito <bob@redivi.com>


Copyright
=========

Copyright 2005 Bob Ippolito <bob@redivi.com>. This program is
dual-licensed free software; you can redistribute it and/or modify it
under the terms of the `MIT License`_ or the `Academic Free License
v2.1`_.

.. _`MIT License`: http://www.opensource.org/licenses/mit-license.php
.. _`Academic Free License v2.1`: http://www.opensource.org/licenses/afl-2.1.php
