import nodeTypeMap from './nodeTypeMap';

export default function nodeType(node) {
    return nodeTypeMap[node.nodeType] || null;
}