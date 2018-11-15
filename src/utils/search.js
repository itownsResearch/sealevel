
// from itowns examples
let binarySearch = function(array, value) {
    var guess,
        min = 0,
        max = array.length - 1;

    while(min <= max){
        guess = Math.floor((min + max) / 2);
    var indices = array[guess].indices;
    var start = indices[0].offset;
    var end = indices[indices.length - 1].offset + indices[indices.length - 1].count;

    if(start <= value && value <= end)
        return guess;
    else if(value > end)
        min = guess + 1;
    else
        max = guess - 1;
     }

     return -1;
}

export default binarySearch;