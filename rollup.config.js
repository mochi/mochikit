const { VERSION } = require('rollup');

module.exports = {
    'input': './MochiKit/index.js',
    'output': {
        'file': 'bundle.js',
        'format': 'iife',
        'dir': 'packed',
        'name': 'mochikit',
        'intro': 'let undefined;',
        //(sorry, but I need it to test in Chrome)
        'treeshake': false,
        'banner': `/** Experimental es6 refactor bundled using Rollup (version "${VERSION}") at "${new Date()}".*/`
    }
}