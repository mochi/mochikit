export default class HSLColor {
    constructor(h, s, l, opacity = 1) {
        this.h = +h;
        this.s = +s;
        this.l = +l;
        this.opacity = opacity;
    }
}