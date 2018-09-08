import padFour from "./padFour";
import padTwo from "./padTwo";

export default function toISODate(date) {
    if (typeof(date) == "undefined" || date === null) {
        return null;
    }
    return [
        padFour(date.getFullYear()),
        padTwo(date.getMonth() + 1),
        padTwo(date.getDate())
    ].join("-");
}