//Useful for catching async callbacks:
export default function asyncCatch(asyncFunction, onerror) {
    return function(...nargs) {
        return asyncFunction.call(this, ...nargs).catch(onerror);
    }
}