import pipeNext from "./pipeNext";
import * as operators from '../base/operators';

function pipe(func) {
    return function iterOperator(iter) {
        return pipeNext(iter, func);
    };
}

export const iadd = pipe(operators.add),
iand = pipe(operators.and),
idiv = pipe(operators.div),
ieq = pipe(operators.eq),
ige = pipe(operators.ge),
igt = pipe(operators.gt),
//TODO: maybe change? this looks a bit weird
iidentity = pipe(operators.identity),
iioempty = pipe(operators.ioempty),
iiofound = pipe(operators.iofound),
ile = pipe(operators.le),
ilogand = pipe(operators.logand),
ilognot = pipe(operators.lognot),
ilogor = pipe(operators.logor),
ilshift = pipe(operators.lshift),
ilt = pipe(operators.lt),
imod = pipe(operators.mod),
imul = pipe(operators.mul),
ine = pipe(operators.ne),
ineg = pipe(operators.neg),
inot = pipe(operators.not),
ior = pipe(operators.or),
irshift = pipe(operators.rshift),
iseq = pipe(operators.seq),
isne = pipe(operators.sne),
isub = pipe(operators.sub),
itruth = pipe(operators.truth),
ixor = pipe(operators.xor),
izrshift = pipe(operators.zrshift);