export default function everyArg(func) {
    return function (...args) {
        let cache, i = 0, len = args.length;

        for(; i < len; ++i) {
            if(!func.call(this, args, cache)) {
                return false;
            }
        }

        //Prevent empty args from passing:
        return len !== 0;
    }
}