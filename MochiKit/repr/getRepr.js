export default function getRepr(object) {
    let repr = object && object.__repr__;
    return repr && typeof repr === 'function' && repr.call(object);
}