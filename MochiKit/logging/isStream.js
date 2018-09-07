//Typescript rocks...
export default function isStream(object) {
    return (
        object &&
        typeof object.write === 'function' &&
        typeof object.end === 'function' &&
        typeof object.on === 'function' &&
        typeof object.off === 'function'
    );
}
