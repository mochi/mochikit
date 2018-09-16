import nodeType from "./nodeType";
//Put regex outside so it isn't recreated on every call.
let re = /\S/;

export default function removeEmptyTextNodes(element, document = document) {
    let cn = element.childNodes;

    if(cn) {
        for(let i = 0, l = cn.length; i < l; ++i) {
            let node = cn[i];

            //TEXT_NODE
            if(nodeType(node) === 3 && !re.test(node.nodeValue)) {
                element.removeChild(node);
            }

            removeEmptyTextNodes(cn[i]);
        }
    }

    return element;
}