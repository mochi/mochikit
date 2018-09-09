import TypeGuard from "./TypeGuard";

export default class StringGuard extends TypeGuard {
    constructor(target) {
        super(target, 'string');
    } 
}