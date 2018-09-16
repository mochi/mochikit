import on from "./on";
import { stubFalse } from "../base/stubs";

export default function disableDrag(element) {
    on(element, 'ondragstart ondrop', stubFalse);
}