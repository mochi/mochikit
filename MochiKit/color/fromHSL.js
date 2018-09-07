import hslToRGB from "./hslToRGB";
import fromRGB from "./fromRGB";

export default function fromHSL(...args/*hue, saturation, lightness, alpha*/) {
    return fromRGB(hslToRGB(...args));
}