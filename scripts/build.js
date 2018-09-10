const rollup = require('rollup');
const [,, ...targetCategories] = process.argv;
const strargv = process.argv.join(' ').replace(/.+\/?build\s+/, '');

for (let item of targetCategories) {
    let inoptions = {
        'input': `../MochiKit/${item}/index.js`,
        'treeshake': false
    }, outoptions = {
        'format': 'iife',
        'file': `${item}.js`,
        'dir': '../packed/',
        'name': `mochikit.${item}`,
        'banner': `/*! MochiKit
        Making JavaScript better and easier with a consistent, clean API.
        Built at "${new Date()}".
        Command line options: "${strargv}"
*/`
    };

    //Put inside loop, as from outside it will block
    //other categories from being built.
    (async function () {
        const bundle = await rollup.rollup(inoptions);
        await bundle.write(outoptions);
    })().catch((err) => {
        throw new Error(`An error happened while writing to /packed. Check you have named all the correct categories.
${err}`);
    })
}