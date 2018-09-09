import TypeGuard from "./TypeGuard";

export default class NumberGuard extends TypeGuard {
    constructor(target) {
        super(target, 'number');
    } 
}