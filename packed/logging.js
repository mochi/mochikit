/**
        * @license
        * MochiKit <https://mochi.github.io/mochikit> 
        * Making JavaScript better and easier with a consistent, clean API.
        * Built at "Sat Sep 15 2018 22:54:07 GMT+0100 (British Summer Time)".
        * Command line options: "MochiKit async base color data datetime dom func iter logging repr"
       */
this.mochikit = this.mochikit || {};
this.mochikit.logging = (function (exports) {
    'use strict';

    //Typescript rocks...
    function isStream(object) {
        return (
            object &&
            typeof object.write === 'function' &&
            typeof object.end === 'function' &&
            typeof object.on === 'function' &&
            typeof object.off === 'function'
        );
    }

    const OFF = 0,
        ERROR = 10,
        WARN = 20,
        INFO = 30,
        DEBUG = 40,
        TRACE = 50;

    var Level = /*#__PURE__*/Object.freeze({
        OFF: OFF,
        ERROR: ERROR,
        WARN: WARN,
        INFO: INFO,
        DEBUG: DEBUG,
        TRACE: TRACE
    });

    class HandlerList {
        constructor() {
            this.handlers = [];
        }

        addHandler(func) {
            if(typeof func !== 'function') {
                throw new Error('Not a function.');
            }

            this.handlers.push(func);
            return this;
        }

        fire(data) {
            this.handlers.forEach((a) => a(data));
        }

        isEmpty() {
            return this.handlers.length === 0;
        }

        isNotEmpty() {
            return !this.isEmpty();
        }

        clear() {
            this.handlers = [];
            return this;
        }
    }

    //This is just a barebones version of log.ts,

    class Logger {
        constructor(stream) {
            if(!isStream(stream)) {
                throw new Error('Expected a WritableStream');
            }

            this.stream = stream;
            this.messages = 0;
            this.level = OFF;
            this.handlers = new HandlerList();
        }

        addHandler(func) {
            this.handlers.addHandler(func);
            return this;
        }

        fireHandlers(func) {
            this.handlers.fire();
        }

        isHandlersEmpty() {
            return this.handlers.isEmpty();
        }

        isHandlersNotEmpty() {
            return !this.isHandlersEmpty();
        }

        clearHandlers() {
            this.handlers.clear();
            return this;
        }

        isLevelAvailable(level) {
            return this.level !== OFF && ~~level <= this.level;
        }

        isErrorAvailable() {
            return this.isLevelAvailable(ERROR);
        }

        isWarnAvailable() {
            return this.isLevelAvailable(WARN);
        }

        isInfoAvailable() {
            return this.isLevelAvailable(INFO);
        }

        isDebugAvailable() {
            return this.isLevelAvailable(DEBUG);
        }

        isTraceAvailable() {
            return this.isLevelAvailable(TRACE);
        }

        isOff() {
            return this.level === OFF;
        }

        isOn() {
            return !this.isOff();
        }

        log(level, data) {
            if(this.isLevelAvailable(level)) {
                this.stream.write(data);
                this.addMessage();
            }
            
            return this;
        }

        addMessage() {
            ++this.messages;
        }

        error(data) {
            return this.log(ERROR, data);
        }

        warn(data) {
            return this.log(WARN, data);
        }

        info(data) {
            return this.log(INFO, data);
        }

        debug(data) {
            return this.log(DEBUG, data);
        }

        trace(data) {
            return this.log(TRACE, data);
        }

        logError(data) {
            return this.log(ERROR, `ERROR: ${data}`); 
        }

        logWarn(data) {
            return this.log(WARN, `WARN: ${data}`);
        }

        logInfo(data) {
            return this.log(INFO, `INFO: ${data}`);
        }

        logTrace(data) {
            return this.log(TRACE, `TRACE: ${data}`);
        }

        logDebug(data) {
            return this.log(DEBUG, `DEBUG: ${data}`);
        }

        clone() {
            let lgr = new Logger(this.stream);
            lgr.level = this.level;
            return lgr;
        }

        __repr__() {
            return `Logger(${this.level}, ${this.messages})`;
        }

        reset() {
            this.level = OFF;
            this.messages = 0;
            return this;
        }

        equals(lgr) {
            return this.matchingLevel(lgr) && this.matchingMessages(lgr);
        }

        matchingLevel(lgr) {
            return lgr.level === this.level; 
        }

        matchingMessages(lgr) {
            return lgr.messages === this.messages;
        }
    }

    class LogMessage {
        constructor(level, data, logger) {
            this.level = level;
            this.data = data;
            this.logger = logger;
            this.timestamp = Date.now();
        }
    }

    function isLogMessage(...args) {
        return args.every((a) => a instanceof LogMessage);
    }

    function printMessage(msg) {
        console.log(`LEVEL: ${msg.level}\nHAS_LOGGER: ${!!msg.logger}\nDATA:\n${msg.data}`); 
    }

    const __repr__ = '[MochiKit.Logger]';
    let currentLogger = new Logger({
        write(data) {
            console.log(data);
        },

        on() {},
        off() {},
        end() {}
    }),
    logError = logMethod(ERROR),
    logWarn = logMethod(WARN),
    logInfo = logMethod(INFO),
    logDebug = logMethod(DEBUG),
    logTrace = logMethod(TRACE);


    function logMethod(level) {
        return function(data) {
            return consoleLogger.log(level, data);
        };
    }

    function setCurrentLogger(stream) {
        currentLogger.stream = stream;
    }

    function getCurrentLogger(stream) {
        return currentLogger;
    }

    exports.__repr__ = __repr__;
    exports.logMethod = logMethod;
    exports.logError = logError;
    exports.logWarn = logWarn;
    exports.logInfo = logInfo;
    exports.logDebug = logDebug;
    exports.logTrace = logTrace;
    exports.Level = Level;
    exports.Logger = Logger;
    exports.setCurrentLogger = setCurrentLogger;
    exports.getCurrentLogger = getCurrentLogger;
    exports.isLogMessage = isLogMessage;
    exports.isStream = isStream;
    exports.LogMessage = LogMessage;
    exports.printMessage = printMessage;

    return exports;

}({}));
