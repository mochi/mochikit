export default function getRepr(object) {
    let repr = object && object.__repr__,
        type = repr ? typeof repr : false;

    return type === 'function'
        ? repr.call(object)
        : type === 'string'
            ? repr
            : null;
}
