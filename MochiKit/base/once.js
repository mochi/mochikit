export default function once(func) {
    let done = false, val;

    return function (...nargs) {
        if(done) {
            return val;
        }

        done = true;
        val = func.call(this, ...nargs);
        return val;
    }
}