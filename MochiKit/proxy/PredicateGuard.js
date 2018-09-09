export default class PredicateGuard extends Proxy {
    constructor(target, set, ErrorClass = Error) {
        super(target, {
            set(obj, prop, value) {
                if(!set.call(this, obj, prop, value)) {
                    //TODO: might change this
                    throw new ErrorClass('Unexpected value');
                }
            }
        });
    }
}
