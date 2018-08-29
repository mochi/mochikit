/**
 * 
 * @param {!Map} map 
 */
export default function reprMap(map) {
    let items = '', val;

    for(let key of map.keys()) {
        val = map.get(key);
        items += `${key} => ${val} `;
    }
    return `Map(${map.size}) { ${items.replace(/\s$/, '')} }`;
}