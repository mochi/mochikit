import ArrayIterator from "./ArrayIterator";

export default function KeyIterator(object) {
    return function* () {
        //This is lazy.
        for(let key in object) {
            if(object.hasOwnProperty(key)) {
                yield key;
            }
        }
    };
}