const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify-es');

if(require.main === module) {
    const [, , ...targetCategories] = process.argv;
    buildMochiKit(targetCategories);
}

function buildMochiKit(args) {
    args = Array.isArray(args) ? args : args.split(/\s+/);
    //A string representation of the arguments.
    const strargv = args.join(' ').replace(/.+\/?build\s+/, '');
    for (let item of args) {
        let inoptions = {
                input: `${
                    item === 'MochiKit'
                        ? '../MochiKit/MochiKit.js'
                        : `../MochiKit/${item}/index.js`
                }`,
                treeshake: false,
                plugins: []
            },
            outoptions = {
                format: 'iife',
                file: `${item}.js`,
                dir: '../packed/',
                name: `${
                    item === 'MochiKit' ? 'mochikit' : `mochikit.${item}`
                }`,
                banner: `/**
  * @license
  * MochiKit <https://mochi.github.io/mochikit> 
  * Making JavaScript better and easier with a consistent, clean API.
  * Built at "${new Date()}".
  * Command line options: "${strargv}"
 */`
            };

        async function build() {
            const bundle = await rollup.rollup(inoptions).catch((e) => { throw e; });
            await bundle.write(outoptions).catch((e) => { throw e; });
        }

        build()
            .catch(err => {
                throw `at category "${item}" unminifed stage: ${err}`;
            })
            .then(err => {
                //Build the minified build now.
                outoptions.file = `${item}.min.js`;
                inoptions.plugins.push(uglify());
                build().catch(err => {
                    throw `at category "${item}" minify stage: ${err}`;
                });
            });
    }
}

module.exports = buildMochiKit;