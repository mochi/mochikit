export default function formatArray(string, array) {
    let re = new RegExp(`\d{1,${array.length}}`, 'g');
    return string.replace(re, (i) => array[i]);
}