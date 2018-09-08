import padTwo from "./padTwo";

export default function toISOTime(date, realISO/* = false */) {
    if (date == null) {
        return null;
    }
    if (realISO) {
        // adjust date for UTC timezone
        date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    }
    var lst = [
        (realISO ? padTwo(date.getHours()) : date.getHours()),
        padTwo(date.getMinutes()),
        padTwo(date.getSeconds())
    ];
    return lst.join(":") + (realISO ? "Z" : "");
}