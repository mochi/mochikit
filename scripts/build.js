const rollup = require('rollup');
const [,, ...targetCategories] = process.argv;
const strargv = process.argv.join(' ').replace(/.+\/?build\s+/, '');
const uglify = require('rollup-plugin-uglify-es');

for (let item of targetCategories) {
    let inoptions = {
        'input': `${item === 'MochiKit' ? '../MochiKit/MochiKit.js' : `../MochiKit/${item}/index.js`}`,
        'treeshake': false,
        'plugins': []
    }, outoptions = {
        'format': 'iife',
        'file': `${item}.js`,
        'dir': '../packed/',
        'name': `${item === 'MochiKit' ? 'mochikit' : `mochikit.${item}`}`,
        'banner': `/**
  * @license
  * MochiKit <https://mochi.github.io/mochikit> 
  * Making JavaScript better and easier with a consistent, clean API.
  * Built at "${new Date()}".
  * Command line options: "${strargv}"
 */`
    };

    async function build() {
        const bundle = await rollup.rollup(inoptions);
        await bundle.write(outoptions);
    }

    build()
    .catch((err) => { throw `at category "${item}" unminifed stage: ${err}`; })
    .then((err) => {
        //Build the minified build now.
        outoptions.file = `${item}.min.js`;
        inoptions.plugins.push(uglify());
        build().catch((err) => { throw `at category "${item}" minify stage: ${err}`});
    });
}