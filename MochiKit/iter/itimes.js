import pipeNext from "./pipeNext";

export default function itimes(iter, amount) {
    return pipeNext(iter, (value) => value * amount);
}