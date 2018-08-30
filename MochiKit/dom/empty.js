export default function empty(node) {
    let first;
    switch(node.nodeType) {
        //Element:
        case 1:
        //fast track.
        node.innerHTML = '';
        
        default:
        //Cache the firstChild call.
        if(node.removeChild && (first = node.firstChild)) {
            while(first) {
                node.removeChild(first);
                //Recompute the value:
                first = node.firstChild;
            }
        }
    }

    return node;
}