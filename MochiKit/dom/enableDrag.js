import { stubFalse } from "../base/stubs";
import off from "./off";

export default function enableDrag(element) {
    off(element, 'ondragstart ondrop', stubFalse);
}