import bytag from "./byTag";

function domShortcut(tag) {
    return function (dom) {
        return bytag(tag, dom);
    }
}

// export const A = domShortcut('a');
// export const ARTICLE = domShortcut('article');
// export const ASIDE = 
//dont know if this is needed yet