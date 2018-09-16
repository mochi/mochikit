export default function escapeHTML(s) {
    return s && s.replace(/&/g, "&amp;"
    ).replace(/"/g, "&quot;"
    ).replace(/</g, "&lt;"
    ).replace(/>/g, "&gt;");
}