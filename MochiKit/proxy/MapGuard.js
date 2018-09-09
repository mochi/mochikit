import PredicateGuard from "./PredicateGuard";

export default class MapGuard extends PredicateGuard {
    constructor(target) {
        super(target, (obj, prop, value) => {
            return value instanceof Map;
        });
    } 
}