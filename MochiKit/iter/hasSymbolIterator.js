export default function hasSymbolIterator(obj) {
    return obj && typeof obj[Symbol.iterator] === 'function';
}