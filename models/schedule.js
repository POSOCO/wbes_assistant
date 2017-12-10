/**
 * Created by Nagasudhir on 12/10/2017.
 */
var WBESUtils = require("../utils/wbesUtils");
var ArrayHelper = require('../helpers/arrayHelpers');

var getIsgsDcObj = module.exports.getIsgsDcObj = function (dateStr, rev, utilId, callback) {
    WBESUtils.getISGSDeclarationsArray(dateStr, rev, utilId, function (err, dcMatrixArray) {
        if (err) {
            callback(new Error(err));
            return;
        }
        var dcMatrixDim = ArrayHelper.getDim(dcMatrixArray);
        if (dcMatrixDim.length < 2 || dcMatrixDim[0] < 98 || dcMatrixDim[1] < 6) {
            callback(new Error('DC matrix is not of minimum required shape of 98*6'));
            return;
        }

        // get all the genNames from 1st row
        var dcFirstRow = dcMatrixArray[0];
        var genNames = ArrayHelper.getUniqueList(dcFirstRow.slice(2));

        //trim all generator names
        genNames = genNames.map(Function.prototype.call, String.prototype.trim);

        // exclude grand total (last column) from the genList
        if (genNames[genNames.length - 1].toLowerCase() == 'grand total') {
            genNames = genNames.slice(0, -1);
        }

        // create a dictionary of generators for result object
        var dcObj = {};
        dcObj['gen_names'] = genNames;
        dcObj['time_blocks'] = [];
        var timeBlkColIndex = dcFirstRow.map(Function.prototype.call, String.prototype.trim).map(Function.prototype.call, String.prototype.toLowerCase).indexOf('time block');
        for (var i = 2; i < Math.min(dcMatrixArray.length, 98); i++) {
            dcObj['time_blocks'].push(+dcMatrixArray[i][timeBlkColIndex]);
        }
        for (var i = 0; i < genNames.length; i++) {
            dcObj[genNames[i]] = {};
            dcObj[genNames[i]]['on_bar_dc'] = [];
            dcObj[genNames[i]]['off_bar_dc'] = [];
            dcObj[genNames[i]]['total_dc'] = [];
        }

        // scan through all the columns for generator names and onbar, offbar, total dc values
        for (var matrixCol = 2; matrixCol < dcMatrixArray[0].length; matrixCol++) {
            // get the genName
            var genName = dcMatrixArray[0][matrixCol].trim();
            if (genName == '') {
                // not a generator, so skip to next iteration
                continue;
            }
            var dcType = dcMatrixArray[1][matrixCol].trim().toLowerCase();
            var dcTypeStrDict = {'onbardc': 'on_bar_dc', 'offbardc': 'off_bar_dc', 'total': 'total_dc'};
            if (['onbardc', 'offbardc', 'total'].indexOf(dcType) > -1) {
                // fill the dc values in the appropriate object array
                var dcValsList = [];
                for (var matrixRow = 2; matrixRow < Math.min(dcMatrixArray.length, 98); matrixRow++) {
                    dcValsList.push(dcMatrixArray[matrixRow][matrixCol]);
                }
                dcObj[genName][dcTypeStrDict[dcType]] = dcValsList;
            }
        }
        return callback(null, dcObj);
    });
};