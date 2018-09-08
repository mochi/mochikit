import iextend from "./iextend";

//Like .exhaust but collects results:
export default function list(iter) {
    return iextend([], iter);
}