import PredicateGuard from "./PredicateGuard";

export default class SetGuard extends PredicateGuard {
    constructor(target) {
        super(target, (obj, prop, value) => {
            return value instanceof Set;
        });
    } 
}