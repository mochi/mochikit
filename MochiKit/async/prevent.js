export default function prevent(promise) {
    return new Promise((resolve) => {
        //Some Promise impls. might not have #then(done, error) compat.
        promise.catch((err) => {
            resolve(err);
            throw err;
        });
        
        promise.then((value) => {
            resolve(value);
            return value;
        });
    });
}
