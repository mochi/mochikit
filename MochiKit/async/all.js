import Deferred from "./Deferred";

//promises = Deferred
export default function all(promises) {
    return new Deferred((resolve, reject) => {
        let unresolved = promises.length - 1,
        values = [];

        for(let deferred of promises) {
            deferred.tap((value) => {
                --unresolved;
                values.push(value);
                if(unresolved === 0) {
                    resolve(values);
                }
            }),tapCatch(reject);
            //Reject at the first broken Deferred.
        }
    });
}