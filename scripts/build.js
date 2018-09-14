const rollup = require('rollup');
const uglify = require('rollup-plugin-uglify-es');

class Banner {
    constructor(strargv) {
        this.strargv = strargv;
    }

    render() {
        return `/**
        * @license
        * MochiKit <https://mochi.github.io/mochikit> 
        * Making JavaScript better and easier with a consistent, clean API.
        * Built at "${new Date()}".
        * Command line options: "${this.strargv}"
       */`;
    }
}

if (require.main === module) {
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
                banner: new Banner(strargv).render()
            };

        build(inoptions, outoptions).then(() =>
            console.log(`[SUCCESS] "${item}" was built.`)
        );
    }
}

function build(inoptions, outoptions) {
    //Why am I getting uncaught promise errors from this?
    //I'm pretty sure I'm catching the promise.
    //Think Rollup needs to up their game here.
    return handlePromise(
        //TODO: make this cleaner.
        rollup.rollup(inoptions).then(bundle => {
            handlePromise(bundle.write(outoptions))
            .then(() => console.log(`Built "${inoptions.input}".`));
        })
    );
}

function handlePromise(promise) {
    return promise.catch(e => {
        throw e;
    });
}

module.exports = buildMochiKit;
