import Deferred from './Deferred';

export default function reject(value) {
    return new Deferred().reject(value);
}