export default class TypeGuard extends Proxy {
    constructor(target, targetType, ErrorClass = Error) {
        super(target, {
            set(obj, prop, value) {
                if(typeof value !== targetType) {
                    throw new ErrorClass('Wrong type of value.');
                }
            }
        });
    }
}