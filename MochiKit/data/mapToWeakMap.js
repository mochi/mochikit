import transformKeyed from "./transformKeyed";

export default function mapToWeakMap(map) {
    return transformKeyed(map, WeakMap);
}