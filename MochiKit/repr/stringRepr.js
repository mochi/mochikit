import getRepr from "./getRepr";

export default function () {
    return function () {
        return getRepr(this.toString());
    }
}