import RepeatIterator from "./RepeatIterator";

export default function repeat(value) {
    return new RepeatIterator(value);
}