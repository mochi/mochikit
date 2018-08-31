export default function pipe(func, ...functions) {
    return function (val, ...args) {
        for(let func of functions) {
            val = func.call(this, val, ...args);
        }

        return val;
    }
}