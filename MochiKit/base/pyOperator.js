import pyoperators from "./pyoperators";
import * as operators from './operators';

export default function pyOperator(op1, operator, op2) {
    let op = pyoperators.get(operator),
    basicop = operators[operator];
    return op ? op(op1, op2) : basicop ? basicop(op1, op2) : null;
}