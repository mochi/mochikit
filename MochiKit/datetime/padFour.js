export default function padFour(n) {
    switch(n.toString().length) {
        case 1: return "000" + n;
        case 2: return "00" + n;
        case 3: return "0" + n;
        default: return n;
    }
}