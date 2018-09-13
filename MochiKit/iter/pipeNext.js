import PipedIterator from "./PipedIterator";

export default function pipeNext(iter, pipe) {
    return new PipedIterator(iter, pipe);
}