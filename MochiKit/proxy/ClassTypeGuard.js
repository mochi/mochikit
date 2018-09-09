export default class ClassTypeGuard extends Proxy {
    constructor(target, classType, ErrorClass = Error) {
        let tostr = Object.prototype.toString;
        super(target, {
            set(obj, prop, value) {
                if(tostr.call(value) !== classType) {
                    throw new ErrorClass('Wrong value class type.');
                }
            }
        });
    }
}