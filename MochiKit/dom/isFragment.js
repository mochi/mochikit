import isNode from "./isNode";

export default function isFragment(doc) {
    return isNode(doc) && doc.nodeType === 11; 
}