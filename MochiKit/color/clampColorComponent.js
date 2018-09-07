export default function clampColorComponent(v, scale) {
    v *= scale;
    return v < 0 ? 0 : v > scale ? scale : v;
}