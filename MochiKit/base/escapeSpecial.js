//This is a big boy, can't find any other way :(
let specialRe = /(\'|\"|\\|\n|\r|\t|\\b|\f|\v|\0)/g
export default function escapeSpecial(str) {
    //This is ugly af:
    return (str + '').replace(specialRe, (match) => {
        switch(match) {
            case '\0':
            return '\\0';
            case '\'':
            return '\\\'';
            case '\"':
            return '\\"';
            case '\n':
            return '\\n';
            case '\r':
            return '\\r';
            case '\t':
            return '\\t';
            case '\b':
            return '\\b';
            case '\f':
            return '\\f';
            case '\v':
            return '\\v';
            case '\0':
            return '\\0';
        }
    });
}