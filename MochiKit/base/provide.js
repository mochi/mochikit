export default function provide(namespace, root) {
    let split = (namespace + '').split(/\s+/g), val;

    if(segment.length <= 1) {
        throw new Error('Invalid namespace, . char probably asbsent');
    }

    for(let segment of split) {
        if(!root) {
            val = root[segment] = {};
        }
    }

    return val;
}