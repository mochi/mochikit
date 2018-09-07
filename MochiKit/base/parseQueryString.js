export default function parseQueryString(encodedString, useArrays) {
    // strip a leading '?' from the encoded string
    var qstr = (encodedString.charAt(0) == "?")
        ? encodedString.substring(1)
        : encodedString;
    var pairs = qstr.replace(/\+/g, "%20").split(/\&amp\;|\&\#38\;|\&#x26;|\&/);
    var o = {};
    var decode;
    if (typeof(decodeURIComponent) != "undefined") {
        decode = decodeURIComponent;
    } else {
        decode = unescape;
    }
    if (useArrays) {
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            var name = decode(pair.shift());
            if (!name) {
                continue;
            }
            var arr = o[name];
            if (!(arr instanceof Array)) {
                arr = [];
                o[name] = arr;
            }
            arr.push(decode(pair.join("=")));
        }
    } else {
        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i].split("=");
            var name = pair.shift();
            if (!name) {
                continue;
            }
            o[decode(name)] = decode(pair.join("="));
        }
    }
    return o;
}