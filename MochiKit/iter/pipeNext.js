import PipedIterator from "./PipedIterator";

export default function pipeNext(iter, pipeFunction) {
    return new PipedIterator(iter, pipeFunction);
}