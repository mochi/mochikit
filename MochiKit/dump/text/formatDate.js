let dateImpl = new Date(),
    //Interpolation method map:
    //m IS case sensitive, M = month, m = min
    dateFunctionMap = {
        ms: () => dateImpl.getMilliseconds(),
        s: () => dateImpl.getSeconds(),
        m: () => dateImpl.getMinutes(),
        h: () => dateImpl.getHours(),
        d: () => dateImpl.getDay(),
        M: () => dateImpl.getMonth(),
        y: () => dateImpl.getFullYear(),
        ums: () => dateImpl.getUTCMilliseconds(),
        us: () => dateImpl.getUTCSeconds(),
        um: () => dateImpl.getUTCMinutes(),
        uh: () => dateImpl.getUTCHours(),
        ud: () => dateImpl.getUTCDay(),
        uM: () => dateImpl.getUTCMonth(),
        uy: () => dateImpl.getUTCFullYear()
    };

let formatDateRe = /[^\\]%d(u?(ms|[smhdMy]))/g;

export default function formatDate(string) {
    return (string + '').replace(formatDateRe, (a, match) => {
        let method = dateFunctionMap[match];
        console.log(method, match);
        if (method) {
            return method();
        } else {
            return null;
        }
    });
}
