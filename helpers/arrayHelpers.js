/**
 * Created by Nagasudhir on 12/04/2017.
 */

// pre: a !== b, each item is a scalar
var array_equals = function (a, b) {
    return a.length === b.length && a.every(function (value, index) {
            return value === b[index];
        });
};

// https://stackoverflow.com/questions/13814621/how-can-i-get-the-dimensions-of-a-multidimensional-javascript-array
var getDim = module.exports.getDim = function (arr) {
    if (typeof arr == 'undefined' || arr == null) {
        return [];
    }
    if (/*!(arr instanceof Array) || */arr.constructor !== Array || typeof arr.length != 'number') {
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

// https://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array
var getUniqueList = module.exports.getUniqueList = function (inpArray) {
    var arr = [];
    if (typeof inpArray == 'undefined' || inpArray == null) {
        return arr;
    }

    if (/*!(arr instanceof Array) || */arr.constructor !== Array || typeof arr.length != 'number') {
        return arr; // current array has no dimension
    }

    for (var i = 0; i < inpArray.length; i++) {
        if (!arr.includes(inpArray[i])) {
            arr.push(inpArray[i]);
        }
    }

    return arr;
};

// https://stackoverflow.com/questions/20798477/how-to-find-index-of-all-occurrences-of-element-in-array
var getAllIndexesOfVal = module.exports.getAllIndexesOfVal = function (arr, val, doTrim) {
    var indexes = [], i;

    if (typeof arr == 'undefined' || arr == null) {
        return indexes;
    }
    if (/*!(arr instanceof Array) || */arr.constructor !== Array || typeof arr.length != 'number') {
        return indexes; // current array has no dimension
    }

    for (i = 0; i < arr.length; i++) {
        if (doTrim == true && typeof arr[i] == 'string') {
            if (arr[i].trim() == val) {
                indexes.push(i);
            }
        } else {
            if (arr[i] == val) {
                indexes.push(i);
            }
        }
    }

    return indexes;
};