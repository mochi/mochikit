import transformKeyed from "./transformKeyed";

export default function cloneMap(set) {
    return transformKeyed(set, Map);
}