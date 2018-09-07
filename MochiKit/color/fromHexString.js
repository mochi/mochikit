import Color from "./Color";

export default function fromHexString(hexCode) {
    if (hexCode[0] == '#') {
        hexCode = hexCode.substring(1);
    }
    var components = [];
    var i, hex;
    if (hexCode.length == 3) {
        for (i = 0; i < 3; i++) {
            hex = hexCode.substr(i, 1);
            components.push(parseInt(hex + hex, 16) / 255.0);
        }
    } else {
        for (i = 0; i < 6; i += 2) {
            hex = hexCode.substr(i, 2);
            components.push(parseInt(hex, 16) / 255.0);
        }
    }

    let [r, g, b, a] = components;
    return new Color(r, g, b, a);
}