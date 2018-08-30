import pipe from "./pipe";

export default function flow(functions) {
    return pipe(functions[0], ...functions.slice(1));
}