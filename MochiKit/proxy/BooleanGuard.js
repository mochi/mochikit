import TypeGuard from "./TypeGuard";

export default class BooleanGuard extends TypeGuard {
    constructor(target) {
        super(target, 'boolean');
    } 
}