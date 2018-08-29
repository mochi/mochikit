const ostr = Object.prototype.toString;

export default function getType(a) {
    switch(a) {
        case null:
        case undefined:
        return `[object ${a === null ? 'Null' : 'Undefined'}]`;
        //Allow faster results for booleans:
        case true:
        case false:
        return '[object Boolean]';
        case NaN:
        case Infinity:
        return '[object Number]';
    }

    if(a === '') {
        return '[object String]';
    }

    return ostr.call(a);
}