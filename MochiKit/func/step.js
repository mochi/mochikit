export default function step(...functions) {
    let i = 0, cache, run = length === i, {length} = functions; 
    return function (...args) {
        if(!run || i >= length) {
            return cache;
        }

        cache = functions[i].call(this, args, cache);
        ++i;
        return cache;
    }
}