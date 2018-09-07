//This is just a barebones version of log.ts,
//I actually get logging.
import isStream from "./isStream";
import * as Level from './Level';
import HandlerList from "./HandlerList";

export default class Logger {
    constructor(stream) {
        if(!isStream(stream)) {
            throw new Error('Expected a WritableStream');
        }

        this.stream = stream;
        this.messages = 0;
        this.level = Level.OFF;
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
        return this.level !== Level.OFF && ~~level <= this.level;
    }

    isErrorAvailable() {
        return this.isLevelAvailable(Level.ERROR);
    }

    isWarnAvailable() {
        return this.isLevelAvailable(Level.WARN);
    }

    isInfoAvailable() {
        return this.isLevelAvailable(Level.INFO);
    }

    isDebugAvailable() {
        return this.isLevelAvailable(Level.DEBUG);
    }

    isTraceAvailable() {
        return this.isLevelAvailable(Level.TRACE);
    }

    isOff() {
        return this.level === Level.OFF;
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
        return this.log(Level.ERROR, data);
    }

    warn(data) {
        return this.log(Level.WARN, data);
    }

    info(data) {
        return this.log(Level.INFO, data);
    }

    debug(data) {
        return this.log(Level.DEBUG, data);
    }

    trace(data) {
        return this.log(Level.TRACE, data);
    }

    logError(data) {
        return this.log(Level.ERROR, `ERROR: ${data}`); 
    }

    logWarn(data) {
        return this.log(Level.WARN, `WARN: ${data}`);
    }

    logInfo(data) {
        return this.log(Level.INFO, `INFO: ${data}`);
    }

    logTrace(data) {
        return this.log(Level.TRACE, `TRACE: ${data}`);
    }

    logDebug(data) {
        return this.log(Level.DEBUG, `DEBUG: ${data}`);
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
        this.level = Level.OFF;
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