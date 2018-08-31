import step from "./step";

export default function stepRight(...functions) {
    return step(...functions.reverse());
}