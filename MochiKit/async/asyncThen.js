//Useful for piping async callbacks:
export default function asyncThen(asyncFunction, pipefunc) {
    return function(...nargs) {
        return asyncFunction.call(this, ...nargs).then(pipefunc);
    }
}