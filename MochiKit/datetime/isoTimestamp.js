//can someone fix that horrible isoTimestamp function?
//Not gonna include it until it looks clean and understandable.
export default function () {}
// export default function isoTimestamp(str) {
//     str = str + "";
//     if (typeof(str) != "string" || str.length === 0) {
//         return null;
//     }
//     var res = str.match(MochiKit.DateTime._isoRegexp);
//     if (typeof(res) == "undefined" || res === null) {
//         return null;
//     }
//     var year, month, day, hour, min, sec, msec;
//     year = parseInt(res[1], 10);
//     if (typeof(res[2]) == "undefined" || res[2] === '') {
//         return new Date(year);
//     }
//     month = parseInt(res[2], 10) - 1;
//     day = parseInt(res[3], 10);
//     if (typeof(res[4]) == "undefined" || res[4] === '') {
//         return new Date(year, month, day);
//     }
//     hour = parseInt(res[4], 10);
//     min = parseInt(res[5], 10);
//     sec = (typeof(res[6]) != "undefined" && res[6] !== '') ? parseInt(res[6], 10) : 0;
//     if (typeof(res[7]) != "undefined" && res[7] !== '') {
//         msec = Math.round(1000.0 * parseFloat("0." + res[7]));
//     } else {
//         msec = 0;
//     }
//     if ((typeof(res[8]) == "undefined" || res[8] === '') && (typeof(res[9]) == "undefined" || res[9] === '')) {
//         return new Date(year, month, day, hour, min, sec, msec);
//     }
//     var ofs;
//     if (typeof(res[9]) != "undefined" && res[9] !== '') {
//         ofs = parseInt(res[10], 10) * 3600000;
//         if (typeof(res[11]) != "undefined" && res[11] !== '') {
//             ofs += parseInt(res[11], 10) * 60000;
//         }
//         if (res[9] == "-") {
//             ofs = -ofs;
//         }
//     } else {
//         ofs = 0;
//     }
//     return new Date(Date.UTC(year, month, day, hour, min, sec, msec) - ofs);
// };