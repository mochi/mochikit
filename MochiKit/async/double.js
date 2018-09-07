export default function double(promise, condition, yes, no) {
    promise.then((value) => {
        return condition(value, promise) ? yes(value, promise) : no(value, promise); 
    });
}