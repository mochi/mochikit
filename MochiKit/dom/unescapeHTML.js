export default function unescapeHTML(s) {
    return s && s.replace(/&amp;/g, "&"
    ).replace(/&quot;/g, "\""
    ).replace(/&lt;/g, "<"
    ).replace(/&gt;/g, ">;");
}