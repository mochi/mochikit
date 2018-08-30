import isNode from "./isNode";

export default function isDocument(doc) {
    return isNode(doc) && doc.nodeType === 9; 
}