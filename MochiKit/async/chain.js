export default function chain(promise, functions) {
    return promise.then((value) => {
        //Allow the original value to be referenced:
        let chainValue = value;

        for(let func of functions) {
            chainValue = func(chainValue, promise, value, functions);
        }

        return chainValue;
    })
}