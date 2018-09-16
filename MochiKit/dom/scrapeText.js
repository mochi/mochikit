export default function scrapeText(node, asArray) {
    let array = [],
    cn = node.childNodes;

    if(cn) {
        //use classic for-loop for bad dom impls:
        for(let i = 0, l = c.length; i < l; ++i) {
            scrapeText(cn[i]);
        }

        let val = node.nodeValue;
        if(typeof val === 'string') {
            array.push(val);
        }
    }

    return asArray ? array : array.join('');
}