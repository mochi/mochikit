export default function camelize(selector) {
    /* from dojo.style.toCamelCase */
    var arr = selector.split('-');
    var cc = arr[0];
    for (var i = 1; i < arr.length; i++) {
        cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
    }
    return cc;
};