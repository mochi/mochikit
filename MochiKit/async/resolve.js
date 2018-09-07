import Deferred from './Deferred';

export default function resolve(value) {
    return new Deferred().resolve(value);
}