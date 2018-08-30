import ownerDocument from "./ownerDocument";

export default function rootChildren(node) {
    let val = ownerDocument(node);
    return val && val.childNodes || null;
}