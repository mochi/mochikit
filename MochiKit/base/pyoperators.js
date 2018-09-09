import * as operators from './operators';

export default new Map()
.set('//', (a, b) => ~~(a / b))
.set('and', (a, b) => a && b)
.set('or', (a, b) => a || b)
.set('not', (a) => !a)
.set('is', (a, b) => a === b)
.set('is not', (a, b) => a !== b)
.set('in', (a, b) => a in b)
.set('not in', (a, b) => !(a in b));