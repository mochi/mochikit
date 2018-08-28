/**
 * 
 * @param {!Set} set 
 */
export default function reprSet(set) {
    return `Set(${set.size}) [ ${Array.from(set.values())} ]`;
}