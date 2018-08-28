export default function reprArray(array) {
    if(!Array.isArray(array)) {
        throw new Error('Expected an array.');
    }

    return `array(${array.length}) [${array.join(', ')}]`;
}