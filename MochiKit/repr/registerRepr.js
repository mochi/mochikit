export default function registerRepr(obj, val) {
    if(obj) {
        //val + '' = toString call
        return obj.__repr__ = val + '';
    }

    return null;
}