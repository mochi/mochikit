import isIterator from "./isIterator";

export default function next(iter) {
    if(isIterator(iter)) {
        try {
            iter.next();
        } catch (err) {
            return err;
        }

        //pass-thru for no error.
        return iter.value;
    }
}