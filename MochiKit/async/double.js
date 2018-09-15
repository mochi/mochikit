export default function double(promise, condition, yes, no) {
    return promise.then((value) => {
        return condition(value, promise) ? yes(value, promise) : no(value, promise); 
    });
}