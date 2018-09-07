export default function ownerDocument(el) {
    if (!el) {
        return null;
    }

    let { ownerDocument, defaultView } = el;
    return ownerDocument || defaultView || el.nodeType === 9 && el || null;
}
