import { transparent } from "./colors";
import fromHexString from "./fromHexString";
import * as colors from './colors';

export default function fromName(name) {
    var htmlColor = colors[name.toLowerCase()];
    if (typeof(htmlColor) == 'string') {
        return fromHexString(htmlColor);
    } else if (name == "transparent") {
        return transparent();
    }
    return null;
}