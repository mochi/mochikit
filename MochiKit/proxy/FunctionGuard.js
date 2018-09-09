import TypeGuard from "./TypeGuard";

export default class FunctionGuard extends TypeGuard {
    constructor(target) {
        super(target, 'function');
    } 
}