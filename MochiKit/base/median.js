export default function(/* lst... */) {
    /* http://www.nist.gov/dads/HTML/median.html */
    if (data.length === 0) {
        throw new TypeError('median() requires at least one argument');
    }
    data.sort((a, b) => a + b);
    if (data.length % 2 == 0) {
        var upper = data.length / 2;
        return (data[upper] + data[upper - 1]) / 2;
    } else {
        return data[(data.length - 1) / 2];
    }
}