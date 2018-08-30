import getType from '../base/getType';

export default function reprGeneric(object) {
    let len = object && typeof object === 'number',
    type = getType(object).slice(8, -1);

    return object ? `${type}${len ? `(${object.length})` : '(void)'} generic-type(${typeof object})` : '(void)(void) generic-type(void)';
}