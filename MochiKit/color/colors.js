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

export const blackColor = createFactory(0, 0, 0),
blueColor = createFactory(0, 0, 1),
brownColor = createFactory(0.6, 0.4, 0.2),
cyanColor = createFactory(0, 1, 1),
darkGrayColor = createFactory(third, third, third),
grayColor = createFactory(0.5, 0.5, 0.5),
greenColor = createFactory(0, 1, 0),
lightGrayColor = createFactory(third2, third2, third2),
magentaColor = createFactory(1, 0, 1),
orangeColor = createFactory(1, 0.5, 0),
purpleColor = createFactory(0.5, 0, 0.5),
redColor = createFactory(1, 0, 0),
transparentColor = createLockedFactory(0, 0, 0, 0),
whiteColor = createFactory(1, 1, 1),
yellowColor = createFactory(1, 1, 0);