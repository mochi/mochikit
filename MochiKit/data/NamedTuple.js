import list from "../iter/list";

export default function NamedTuple(defaults = [], repr) {
    return class Tuple extends Set {
        constructor(iterable) {
            super(iterable);

            if(repr == null) {
                this.__repr__ = function () {
                    return `NamedTuple(${this.size})`;
                }
            } else {
                this.__repr__ = repr;
            }

            this.defaults = defaults;
            let len = defaults.length || defaults.size || 0;

            //This might work, not too sure:
            //looks like it would, but I'm not 100% tbch.
            if (len !== 0) {
                //Allow Sets and Arrays for defaults:
                let items = list(this.values()),
                defaultArray = list(defaults),
                needsFilling = items.length < len;

                if(needsFilling) {
                    for(let index = items.length - 1; index < len; ++index) {
                        this.add(defaultArray[index]);
                    }
                }
            }
        }
    };
}
