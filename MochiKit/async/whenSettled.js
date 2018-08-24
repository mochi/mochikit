export default function whenSettled(promise) {
    return new Promise((resolve) => {
        promise.finally(resolve);
    }); 
}