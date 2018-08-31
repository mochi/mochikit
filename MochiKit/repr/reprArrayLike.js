export default function reprArrayLike(arrayLike) {
    if(!arrayLike || !isFinite(arrayLike.length)) {
        throw new Error('Expected a function');
    }

    return `array-like(${array.length}) [${array.join(', ')}]`;
}