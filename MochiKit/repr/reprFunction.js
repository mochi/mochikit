export default function reprFunction(func) {
    if(typeof func !== 'function') {
        throw new Error('Expected a function');
    }

    //Don't allow bogus __repr__ methods pass thru.
    return `function "${func.name}"(${func.length}) ${typeof func.__repr__ === 'function' ? func.__repr__() : `function ${func.name} \{...\}`}`;
}