import LogMessage from "./LogMessage";

export default function isLogMessage(...args) {
    return args.every((a) => a instanceof LogMessage);
}