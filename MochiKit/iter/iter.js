import AdapterRegistry from '../base/AdapterRegistry';
import NotFoundError from '../base/NotFoundError';
import getRepr from '../repr/getRepr';

export default function iter(iterable, /* optional */ sentinel) {
    if (arguments.length >= 2) {
        return self.takewhile(
            function (a) { return a != sentinel; },
            iterable
        );
    }
    if (typeof(iterable.next) == 'function') {
        return iterable;
    } else if (typeof(iterable.iter) == 'function') {
        return iterable.iter();
    }

    //TODO: make AdapterRegistry not throw on error.
    try {
        return iter.registry.match(iterable);
    } catch(err) {
        if(err instanceof NotFoundError) {
            throw new TypeError(`${getRepr(iterable)} is not iterable (not found in registry).`);
        }

        throw err;
    }
}

iter.registry = new AdapterRegistry();