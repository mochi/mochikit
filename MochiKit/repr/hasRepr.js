export default function hasRepr(object) {
    let repr = object && object.__repr__;
    return repr && typeof repr === 'function';
}