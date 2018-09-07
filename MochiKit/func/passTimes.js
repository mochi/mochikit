export default function passTimes(func) {
    let times = -1; 
    return function (...args) {
        return func.call(this, times, args);
    }
}