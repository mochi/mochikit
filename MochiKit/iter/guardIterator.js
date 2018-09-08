import isIterator from "./isIterator";

export default function guardIterator(itr, guard) {
    if(isIterator(itr)) {
        let oldNext = itr.next;
        //Add generator support:
        itr.next = function (...args) {
            oldNext.call(this, ...args);
            guard.call(this, ...args);
        };
    }

    //pass thru, isn't iterator
    return null;
}