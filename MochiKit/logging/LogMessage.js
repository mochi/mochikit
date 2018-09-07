export default class LogMessage {
    constructor(level, data, logger) {
        this.level = level;
        this.data = data;
        this.logger = logger;
        this.timestamp = Date.now();
    }
}