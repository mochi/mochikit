export default function choice(seq, min = 0, max) {
    max = max || seq.length;
    let index = Math.random() * (max - min) + min;
    return seq[index];
}