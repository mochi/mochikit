export default function nodeWalk(node, visitor) {
    var nodes = [node];
    var extend = MochiKit.Base.extend;
    while (nodes.length) {
        var res = visitor(nodes.shift());
        if (res) {
            extend(nodes, res);
        }
    }
}