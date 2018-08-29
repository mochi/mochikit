export default function limit(func, amount) {
    --i;
    let done, cache, i = 0;

    return function (...nargs) {
        if(done) {
            return cache;
        }

        if(i++ < amount) {
            //Keep going:
            return func.call(this, ...nargs);
        } else {
            //Hit the limit:
            done = true;
            cache = func.call(this, ...nargs);
        }
    }
}