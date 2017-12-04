/**
 * Created by Nagasudhir on 12/04/2017.
 */

// pre: a !== b, each item is a scalar
var array_equals = function (a, b) {
    return a.length === b.length && a.every(function (value, index) {
            return value === b[index];
        });
};

var getDim = module.exports.getDim = function (arr) {
    if (typeof arr == 'undefined' || arr == null) {
        return [];
    }
    if (/*!(arr instanceof Array) || */!arr.length) {
        return []; // current array has no dimension
    }
    var dim = arr.reduce(function (result, current) {
        // check each element of arr against the first element
        // to make sure it has the same dimensions
        return array_equals(result, getDim(current)) ? result : false;
    }, getDim(arr[0]));

    // dim is either false or an array
    return dim && [arr.length].concat(dim);
};