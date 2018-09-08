import padTwo from "./padTwo";

export default function toPaddedAmericanDate(d) {
    if (d == null) {
        return null;
    }

    return [
        padTwo(d.getMonth() + 1),
        padTwo(d.getDate()),
        d.getFullYear()
    ].join('/');
}