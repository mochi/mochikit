let spaceRe = /\s+/;

export default function on(node, event, func) {
    if(spaceRe.test(event)) {
        //Multiple events.
        for(let actualEvent of event) {
            node.addEventListener(actualEvent, func);
        }
    } else {
        node.addEventListener(event, func);
    }

    return node;
}