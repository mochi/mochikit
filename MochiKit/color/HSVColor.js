export default class HSVColor {
    constructor(h, s, v, opacity = 1) {
        this.h = +h;
        this.s = +s;
        this.v = +v;
        this.opacity = opacity;
    }
}