import isObject from '../base/isObject';
import isNumber from '../base/isNumber';

export default function isNode(node) {
    return typeof node === 'object' && isNumber(node.nodeType) && !isObject(node);
}