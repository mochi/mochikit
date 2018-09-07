export default function flattenArray(array) {
    let flattened = [];

    for(let item of array) {
        Array.isArray(item) ? flattened.push(...item) : flattened.push(item);
    }

    return flattened;
}