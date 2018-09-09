module.exports = {
    'input': './MochiKit/index.js',
    'output': {
        'file': 'bundle.js',
        'format': 'iife',
        'dir': 'packed',
        'name': 'mochikit',
        'intro': 'const undefined;',
        //(sorry, but I need it to test in Chrome)
        'treeshake': false,
        'banner': `/*Bundled with Rollup at "${new Date()}".*/`
    }
}