import isIterable from "./isIterable";

export default function next(iter) {
    if(isIterable(iter)) {
        try {
            iter.next();
        } catch (err) {
            return err;
        }

        //pass-thru for no error.
        return iter.value;
    }
}