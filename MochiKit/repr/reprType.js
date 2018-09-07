export default function reprType(object) {
    let len, hasLen;
    return `${typeof object}${(hasLen = typeof (len = object.length) === 'number') ? `(${len})` : '(void)'}`;
}