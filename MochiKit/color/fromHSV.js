import hsvToRGB from "./hsvToRGB";
import fromRGB from "./fromRGB";

export default function fromHSV(...args /* hue, saturation, value, alpha */) {
    return fromRGB(hsvToRGB(...args));
}