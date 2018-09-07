import Color from "./Color";

export default function isColor(...args) {
    return args.every((a) => a && a instanceof Color);
}