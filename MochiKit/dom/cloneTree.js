export default function cloneTree(node, deep) {
    //Get the tree from the node.
    let root = node.getRootNode();
    return root.cloneNode(deep);
}