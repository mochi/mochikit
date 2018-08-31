export default function clampColorComponent(v, scale) {
    v *= scale;
    if (v < 0) {
        return 0;
    } else if (v > scale) {
        return scale;
    } else {
        return v;
    }
}