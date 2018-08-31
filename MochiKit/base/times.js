export default function times(func, amount) {
    let isFunc = typeof func === 'function',
    accum = [];
    
    for(let i = 0; i < amount; ++i) {
        accum.push(isFunc ? func(i, amount, accum) : func);
    }

    return accum;
}