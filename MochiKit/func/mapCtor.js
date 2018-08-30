import ctor from "./ctor";

export default function mapCtors(...ctors) {
    return ctors.map(ctor);
}