export const __repr__ = '[MochiKit.Logger]';
import Logger from './Logger';
import * as Level from './Level';
let currentLogger = new Logger({
    write(data) {
        console.log(data);
    },

    on() {},
    off() {},
    end() {}
}),
logError = logMethod(Level.ERROR),
logWarn = logMethod(Level.WARN),
logInfo = logMethod(Level.INFO),
logDebug = logMethod(Level.DEBUG),
logTrace = logMethod(Level.TRACE);


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

export {
    logMethod,
    logError,
    logWarn,
    logInfo,
    logDebug,
    logTrace,
    Level,
    Logger,
    setCurrentLogger,
    getCurrentLogger
};

export { default as isLogMessage } from './isLogMessage.js';
export { default as isStream } from './isStream.js';
export { default as LogMessage } from './LogMessage.js';
export { default as printMessage } from './printMessage.js';