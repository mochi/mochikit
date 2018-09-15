import isPromise from './isPromise';
import isThenable from './isThenable';

export default function isAsync(object) {
    return object && (isThenable(object) || isPromise(object));
}
