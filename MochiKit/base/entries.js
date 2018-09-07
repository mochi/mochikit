import keys from './keys';

export default function entries(object) {
    return keys(object).map((key) => [key, object[key]]);
}