export default function prependE(parent, el) {
    let first = parent.firstChild;

    if(first) {
        parent.insertBefore(el, first);
    }

    return parent;
}