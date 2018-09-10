import forEach from "../iter/forEach";

export default function eachliE(element, predicate) {
    if(element.tagName !== 'UL') {
        return element;
    }

    forEach(element.children, (...args) => {
        args[0].tagName === 'LI' && predicate(...args);
    });

    return element;
}