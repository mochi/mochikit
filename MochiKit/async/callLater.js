export default function callLater(func, timeout) {
    if(typeof func !== 'function') {
        throw new Error('Evaluating strings and bogus functions are not supported.');
    }

    setTimeout(func, timeout);
}