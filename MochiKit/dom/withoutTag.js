import forEach from "../iter/forEach";

export default function withoutTagE(el, tag) {
    forEach(el.children, (child) => {
        if(child.tagName === tag) {
            el.removeChild(child);
        }
    });

    return el;
}