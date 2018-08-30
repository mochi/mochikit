export default function nodeCallback(func, onerror) {
    return function (err, ...data) {
        if(err) {
            onerror(err, data);
        } else {
            func(...data);
        }
    }
}