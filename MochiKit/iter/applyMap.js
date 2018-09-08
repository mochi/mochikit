export default function applyMap(func, items) {
    for(let item of items) {
        func.call(this, item);
    }
}