import Color from "./Color";

const third = 1.0 / 3.0,
third2 = third * 2;
function createFactory(r, g, b) {
    return function (a) {
        return new Color(r, g, b, a);
    };
}

function createLockedFactory(r, g, b, a) {
    let factory = createFactory(r, g, b);
    
    return function () {
        return factory(a);
    };
}

export const black = createFactory(0, 0, 0),
blue = createFactory(0, 0, 1),
brown = createFactory(0.6, 0.4, 0.2),
cyan = createFactory(0, 1, 1),
darkGray = createFactory(third, third, third),
gray = createFactory(0.5, 0.5, 0.5),
green = createFactory(0, 1, 0),
lightGray = createFactory(third2, third2, third2),
magenta = createFactory(1, 0, 1),
orange = createFactory(1, 0.5, 0),
purple = createFactory(0.5, 0, 0.5),
red = createFactory(1, 0, 0),
transparent = createLockedFactory(0, 0, 0, 0),
white = createFactory(1, 1, 1),
yellow = createFactory(1, 1, 0);