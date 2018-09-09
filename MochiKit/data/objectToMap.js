import objectToKeyed from "./objectToKeyed";

export default function objectToMap(object) {
    return objectToKeyed(object, Map);
}