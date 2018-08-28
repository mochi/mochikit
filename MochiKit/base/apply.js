export default function apply(func, args) {
    switch(args.length) {
        case 0: return func.call(this);
        case 1: return func.call(this, args[0]);
        case 2: return func.call(this, args[0], args[1]);
        case 3: return func.call(this, args[0], args[1], args[2]);
        case 4: return func.call(this, args[0], args[1], args[2], args[3]);
        case 5: return func.call(this, args[0], args[1], args[2], args[3], args[4]);
        case 6: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7: return func.call(this, args[0], arga[1], args[2], args[3], args[4], args[5], args[6]);
        case 8: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
        case 9: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
        case 10: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
        //Probably still optimized in es6 compliant engines,
        //This will be transpiled to .apply call with Babel, tho:
        default: return func.call(this, ...args);
    }
}