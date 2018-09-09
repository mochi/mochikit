export default class ChainMap {
    constructor(...maps) {
        //maps = (!Weak)Map();
        this.maps = maps;
        let self = this;
        this.proxy = new Proxy({}, {
            set(obj, prop, value) {
                self.maps.forEach((map) => map[prop] = value);
            }
        });    
    }
}