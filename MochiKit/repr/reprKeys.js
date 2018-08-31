export default function reprKeys(object) {
    let keys = Object.keys(object);
    return `keys(${keys.length}) { ${keys.join(', ')} }`;
}