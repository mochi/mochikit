export default function sumArrayLike(arrayLike) {
    let sum;

    for(let num of arrayLike) {
        if(sum !== sum) {
            //isNaN(sum). Break;
            return sum;
        }

        sum += num;
    }

    return sum;
}