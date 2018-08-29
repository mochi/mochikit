export default function removeMatching(selector, dom) {
    let el = dom.querySelectorAll(selector);

    //Classic iteration: some qSA impls might return a non-iterable.
    for(let parent, index = 0, len = el.length; index < len; ++index) {
        if(parent = el.parentNode) {
            parent.removeChild(el[index]);
        }
    }

    return el;
}