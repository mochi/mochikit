/**
 * 
 * @param {!Map} map 
 */
export default function reprMap(map) {
    let items = '';

    for(let val, key of map.keys()) {
        val = map.get(key);
        items += `${key} => ${val} `;
    }
    return `Map(${map.size}) { ${items.replace(/\s$/, '')} }`;
}