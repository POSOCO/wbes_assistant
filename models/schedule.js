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

var getIsgsNetSchObj = module.exports.getIsgsNetSchObj = function (utilId, dateStr, rev, isSeller, callback) {
    WBESUtils.getUtilISGSNetSchedules(utilId, dateStr, rev, isSeller, function (err, netSchMatrixArray) {
        var netSchMatrixDim = ArrayHelper.getDim(netSchMatrixArray);
        if (netSchMatrixDim.length < 2 || netSchMatrixDim[0] < 98 || netSchMatrixDim[1] < 11) {
            callback(new Error('Net Schedules matrix is not of minimum required shape of 98*11'));
            return;
        }

        // get all the genNames from 1st row
        var firstRow = netSchMatrixArray[0];
        var genNames = ArrayHelper.getUniqueList(firstRow.slice(2));

        //trim all generator names
        genNames = genNames.map(Function.prototype.call, String.prototype.trim);

        // exclude grand total (last column) from the genList
        var unwantedColIndex = genNames.map(Function.prototype.call, String.prototype.toLowerCase).indexOf('grand total');
        if (unwantedColIndex != -1) {
            genNames.splice(unwantedColIndex, 1);
        }
        unwantedColIndex = genNames.map(Function.prototype.call, String.prototype.toLowerCase).indexOf('');
        if (unwantedColIndex != -1) {
            genNames.splice(unwantedColIndex, 1);
        }

        // create a dictionary of generators for result object
        var netSchObj = {};
        netSchObj['gen_names'] = genNames;
        netSchObj['time_blocks'] = [];
        var timeBlkColIndex = firstRow.map(Function.prototype.call, String.prototype.trim).map(Function.prototype.call, String.prototype.toLowerCase).indexOf('time block');
        for (var i = 2; i < Math.min(netSchMatrixArray.length, 98); i++) {
            netSchObj['time_blocks'].push(+netSchMatrixArray[i][timeBlkColIndex]);
        }
        for (var i = 0; i < genNames.length; i++) {
            netSchObj[genNames[i]] = {};
            netSchObj[genNames[i]]['isgs'] = [];
            netSchObj[genNames[i]]['mtoa'] = [];
            netSchObj[genNames[i]]['lta'] = [];
            netSchObj[genNames[i]]['stoa'] = [];
            netSchObj[genNames[i]]['iex'] = [];
            netSchObj[genNames[i]]['pxi'] = [];
            netSchObj[genNames[i]]['urs'] = [];
            netSchObj[genNames[i]]['rras'] = [];
            netSchObj[genNames[i]]['total'] = [];
        }

        // scan through all the columns for generator names and onbar, offbar, total dc values
        for (var matrixCol = 2; matrixCol < netSchMatrixArray[0].length; matrixCol++) {
            // get the genName
            var genName = netSchMatrixArray[0][matrixCol].trim();
            if (genName == '') {
                // not a generator, so skip to next iteration
                continue;
            }
            var netSchType = netSchMatrixArray[1][matrixCol].trim().toLowerCase();
            if (['isgs', 'mtoa', 'lta', 'stoa', 'iex', 'pxi', 'urs', 'rras', 'total'].indexOf(netSchType) > -1) {
                // fill the dc values in the appropriate object array
                var dcValsList = [];
                for (var matrixRow = 2; matrixRow < Math.min(netSchMatrixArray.length, 98); matrixRow++) {
                    dcValsList.push(netSchMatrixArray[matrixRow][matrixCol]);
                }
                netSchObj[genName][netSchType] = dcValsList;
            }
        }
        return callback(null, netSchObj);
    });
};

var getISGSURSAvailedObj = module.exports.getISGSURSAvailedObj = function (dateStr, fromTB, toTB, rev, utilId, callback) {
    WBESUtils.getISGSURSAvailedArray(dateStr, rev, utilId, function (err, ursAvailedRows) {
        if (err) {
            callback(new Error(err));
            return;
        }
        var ursAvailedRowsDim = ArrayHelper.getDim(ursAvailedRows);
        if (ursAvailedRowsDim.length < 2 || ursAvailedRowsDim[0] < 102 || ursAvailedRowsDim[1] < 1) {
            callback(new Error('URS availed matrix is not of minimum required shape of 98*1'));
            return;
        }
        if (fromTB == null || isNaN(fromTB)) {
            fromTB = 1;
        }
        if (toTB == null || isNaN(toTB)) {
            toTB = 1;
        }
        // get all the genNames from 1st row
        var genNamesRow = ursAvailedRows[0];
        var consNamesRow = ursAvailedRows[1];
        var URSAvailedInfoArray = []; // list of [gen, cons, min, max] arrays
        for (var colIter = 0; colIter < genNamesRow.length; colIter++) {
            if (genNamesRow[colIter] == null || genNamesRow[colIter] == "") {
                continue;
            }
            var genName = genNamesRow[colIter];
            var consName = consNamesRow[colIter];
            // Now find the range of the URS availed by iterating in the column
            var maxURSAvailed = null;
            var minURSAvailed = null;
            for (var blkIter = fromTB; blkIter < (toTB + 1); blkIter++) {
                var rowIter = blkIter + 1;
                var mwVal = Math.round(Number(ursAvailedRows[rowIter][colIter]));
                if (mwVal > 1) {
                    if (maxURSAvailed == null || mwVal > maxURSAvailed) {
                        maxURSAvailed = mwVal;
                    }
                    if (minURSAvailed == null || mwVal < minURSAvailed) {
                        minURSAvailed = mwVal;
                    }
                }
            }
            if (minURSAvailed != null && maxURSAvailed != null) {
                // we got valid URS summary, so push to the URSAvailedInfoArray array
                URSAvailedInfoArray.push([genName, consName, minURSAvailed, maxURSAvailed]);
            }
        }
        // sort the info by max URS availed
        // https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
        var compareFunc = function(a,b) {
            if (a[3] < b[3])
                return 1;
            if (a[3] > b[3])
                return -1;
            return 0;
        };
        URSAvailedInfoArray.sort(compareFunc);
        return callback(null, URSAvailedInfoArray);
    });
};