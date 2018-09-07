import ownerDocument from './ownerDocument';

export default function (doc) {
    let val = ownerDocument(doc);
    return val && val.body || null;
}