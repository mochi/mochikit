export default function without(array, ...values) {
    return array.filter((item) => {
        for(let value of values) {
            if(value === item) {
                return true;
            }
        }

        return false;
    });
}