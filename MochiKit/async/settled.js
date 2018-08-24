export default function settled(promise) {
    return new Promise((resolve) => {
        promise.finally(resolve);
    }); 
}