import isPromise from './isPromise';
import isThenable from './isThenable';

export default function isAsync(object) {
    return isPromise(object) || isThenable(object);
}
