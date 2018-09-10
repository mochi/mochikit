import forEach from "../iter/forEach";

export default function filterC(el, predicate, deep) {
    let clone = el.cloneNode(deep);
    forEach(el.children, (...args) => {
        !predicate(...args) && clone.removeChild(args[0]);
    });
    return clone;
}