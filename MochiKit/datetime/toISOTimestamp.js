import toISODate from "./toISODate";
import toISOTime from "./toISOTime";

export default function toISOTimestamp(date, realISO/* = false*/) {
    if (date == null) {
        return null;
    }

    var time = toISOTime(date, realISO);
    var sep = realISO ? "T" : " ";
    if (realISO) {
        // adjust date for UTC timezone
        date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    }
    return toISODate(date) + sep + time;
};