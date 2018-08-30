import ownerDocument from './ownerDocument';
import empty from './empty';

export default function clearRoot(node) {
    let doc = ownerDocument(node);
    return doc && empty(doc);
}
