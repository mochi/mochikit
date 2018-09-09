import Deferred from "../async/Deferred";

export default class ImageLoader {
    constructor() {
        this.failed = new Set();
        this.loaded = new Set();
    }

    load(imgurl, document, attributes) {
        let self = this;
        return new Deferred((resolve, reject) => {
            let el = document.createElement('img', attributes);
            el.onload = resolve;
            el.onerror = reject;
            el.url = imgurl;
            el.addEventListener('load', () => self.loaded.add(imgurl));
            el.addEventListener('error', () => self.failed.add(imgurl));
        });
    }

    createLoader(imgurl, document, attributes) {
        let self = this;
        return function boundLoader() {
            return self.load(imgurl, document, attributes);
        };
    }

    loadAfterDOM(imgurl, document, attributes) {
        let self = this;
        document.addEventListener('DOMContentLoaded', () => self.load(imgurl, document, attributes));
        return this;
    }
}