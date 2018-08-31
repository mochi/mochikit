export default function warnDeprecated(method, depfrom, altfunc, message, fallbackval) {
    //Compute the msg once for heavily used methods:
    let depmsg = `The "${method}" is deprecated ${depfrom ? `from ${depfrom} onwards` : ''}. ${altfunc ? `Instead use ${altfunc}` : ''}${message ? `\n${message}` : ''}`;
    return function () {
        console.error(depmsg);
        return fallbackval;
    }
}