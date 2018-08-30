let spaceRe = /\s+/;

export default function off(node, event, func) {
    if(spaceRe.test(event)) {
        //Multiple events.
        for(let actualEvent of event) {
            node.removeEventListener(actualEvent, func);
        }
    } else {
        node.removeEventListener(event, func);
    }

    return node;
}