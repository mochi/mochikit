import StopIteration from "./StopIteration";

export default function breakOldLoop() {
    throw StopIteration;
}