export default function arity(func, amount) {
    switch (amount) {
        case 0:
            return function() {
                return func.call(this);
            };
        case 1:
            return function($a) {
                return func.call(this, $a);
            };
        case 2:
            return function($a, $b) {
                return func.call(this, $a, $b);
            };
        case 3:
            return function($a, $b, $c) {
                return func.call(this, $a, $b, $c);
            };
        case 4:
            return function($a, $b, $c, $d) {
                return func.call(this, $a, $b, $c, $d);
            };
        case 5:
            return function($a, $b, $c, $d, $e) {
                return func.call(this, $a, $b, $c, $d, $e);
            };
        case 6:
            return function($a, $b, $c, $d, $e, $f) {
                return func.call(this, $a, $b, $c, $d, $e, $f);
            };
        case 7:
            return function($a, $b, $c, $d, $e, $f, $g) {
                return func.call(this, $a, $b, $c, $d, $e, $f, $g);
            };
        case 8:
            return function($a, $b, $c, $d, $e, $f, $g, $h) {
                return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h);
            };
        case 9:
            return function($a, $b, $c, $d, $e, $f, $g, $h, $i) {
                return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h, $i);
            };
        case 10:
            return function($a, $b, $c, $d, $e, $f, $g, $h, $i, $j) {
                return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h, $i, $j);
            };

        default:
            throw new Error('Out of range');
    }
}
