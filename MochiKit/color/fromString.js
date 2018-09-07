import fromRGBString from "./fromRGBString";
import fromHSLString from "./fromHSLString";
import fromHexString from "./fromHexString";
import fromName from "./fromName";

export default function fromString(colorString) {
    var three = colorString.substr(0, 3);
    if (three == "rgb") {
        return fromRGBString(colorString);
    } else if (three == "hsl") {
        return fromHSLString(colorString);
    } else if (colorString.charAt(0) == "#") {
        return fromHexString(colorString);
    }
    return fromName(colorString);
}