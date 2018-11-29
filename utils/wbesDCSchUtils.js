var ArrayHelper = require('../helpers/arrayHelpers');
var async = require('async');
var WBESUtils = require('./wbesUtils');
var CSVFetcher = require('./csvFetcher');
StringUtils = require('./stringUtils');

var getISGSDcOnbarSchArray = module.exports.getISGSDcOnbarSchArray = function (date_str, rev, utilId, callback) {
    // fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            WBESUtils.fetchCookiesFromReportsUrl(function (err, cookieObj) {
                if (err) {
                    return callback(err);
                }
                return callback(null, cookieObj);
            });
        }
    ], function (error, cookieObj) {
        if (error) {
            return callback(err);
        }
        var options = WBESUtils.defaultRequestOptions;

        var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        // options.headers.cookie = cookieString;
        console.log("Cookie String for seller dc, onbar and schedule is " + cookieString);
        var templateUrl = WBESUtils.isgsOnbarSchFetchUrl;
        options.url = StringUtils.parse(templateUrl, WBESUtils.baseUrl, date_str, rev, utilId);
        console.log("ISGS dc, onbar and schedule JSON fetch url created is " + options.url);

        // get the declarations Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsOnbarSchArray = JSON.parse(resBody)['jaggedarray'];

            // remove the revision number from the beneficiary name
            var row = isgsOnbarSchArray[1];
            // remove brackets from second row
            for (var i = 0; i < row.length; i++) {
                var bracketIndex = row[i].indexOf("(");
                if (bracketIndex != -1) {
                    row[i] = row[i].substring(0, bracketIndex);
                }
            }
            isgsOnbarSchArray[1] = row;

            callback(null, isgsOnbarSchArray);
        });
    });
};

var getIsgsDcOnbarSchObj = module.exports.getIsgsDcOnbarSchObj = function (dateStr, rev, utilId, callback) {
    getISGSDcOnbarSchArray(dateStr, rev, utilId, function (err, dcOnbarSchArray) {
        if (err) {
            callback(new Error(err));
            return;
        }
        var dcOnbarSchDim = ArrayHelper.getDim(dcOnbarSchArray);
        if (dcOnbarSchDim.length < 2 || dcOnbarSchDim[0] < 98 || dcOnbarSchDim[1] < 5) {
            callback(new Error('DC, Onbar, Sch matrix is not of minimum required shape of 98*5'));
            return;
        }

        // get all the genNames from 1st row
        var dcOnbarSchFirstRow = dcOnbarSchArray[0];
        var genNames = ArrayHelper.getUniqueList(dcOnbarSchFirstRow.slice(2));

        //trim all generator names
        genNames = genNames.map(Function.prototype.call, String.prototype.trim);

        // create a dictionary of generators for result object
        var dcOnbarSchObj = {};
        dcOnbarSchObj['gen_names'] = genNames;
        dcOnbarSchObj['time_blocks'] = [];
        var timeBlkColIndex = dcOnbarSchArray[1].map(Function.prototype.call, String.prototype.trim).map(Function.prototype.call, String.prototype.toLowerCase).indexOf('time block');
        for (var i = 2; i < Math.min(dcOnbarSchArray.length, 98); i++) {
            dcOnbarSchObj['time_blocks'].push(+dcOnbarSchArray[i][timeBlkColIndex]);
        }

        // initialize the arrays
        for (var i = 0; i < genNames.length; i++) {
            dcOnbarSchObj[genNames[i]] = {};
            dcOnbarSchObj[genNames[i]]['on_bar_dc'] = [];
            dcOnbarSchObj[genNames[i]]['total_dc'] = [];
            dcOnbarSchObj[genNames[i]]['total'] = [];
        }

        // scan through all the columns for generator names and onbar, sch, total dc values
        for (var matrixCol = 2; matrixCol < dcOnbarSchArray[0].length; matrixCol++) {
            // get the genName
            var genName = dcOnbarSchArray[0][matrixCol].trim();
            if (genName == '') {
                // not a generator, so skip to next iteration
                continue;
            }
            var dcType = dcOnbarSchArray[1][matrixCol].trim().toLowerCase();
            var dcTypeStrDict = { 'dc': 'total_dc', 'dc for sch': 'on_bar_dc', 'schedule': 'total' };
            if (['dc', 'dc for sch', 'schedule'].indexOf(dcType) > -1) {
                // fill the dc values in the appropriate object array
                var dcValsList = [];
                for (var matrixRow = 2; matrixRow < Math.min(dcOnbarSchArray.length, 98); matrixRow++) {
                    dcValsList.push(dcOnbarSchArray[matrixRow][matrixCol]);
                }
                dcOnbarSchObj[genName][dcTypeStrDict[dcType]] = dcValsList;
            }
        }
        return callback(null, dcOnbarSchObj);
    });
};

var getNewIsgsMarginsObj = module.exports.getNewIsgsMarginsObj = function (utilId, date_str, rev, callback) {
    var getDCOnbarSchArray = function (callback) {
        getIsgsDcOnbarSchObj(date_str, rev, utilId, function (err, dcOnbarSchArray) {
            if (err) {
                return callback(err);
            }
            return callback(null, { 'schObj': dcOnbarSchArray });
        });
    };

    var computeMargins = function (resObj, callback) {
        const onBarVals = [];
        const schVals = [];
        const numGensToIter = (utilId == 'ALL') ? resObj['schObj']['gen_names'].length : 1;
        // if utilId is ALL then compute margin for all generators
        for (let genIter = 0; genIter < numGensToIter; genIter++) {
            const genName = resObj['schObj']['gen_names'][genIter];
            //console.log(genName);
            var onBarValsTemp = resObj['schObj'][genName]['on_bar_dc'];
            var schValsTemp = resObj['schObj'][genName]['total'];
            if (onBarValsTemp == undefined || onBarValsTemp.constructor.name != "Array" || schValsTemp == undefined || schValsTemp.constructor.name != "Array") {
                // arrays not returned so throw an error
                return callback(new Error('Undesired api result found'));
            }
            if (onBarValsTemp.length != schValsTemp.length) {
                //check if dc and schedule array are of same length
                return callback(new Error('schedule and dc arrays are not of same length'));
            }
            if (genIter == 0) {
                // initialize the onbar and schedule arrays to zero for first generator
                for (let iter = 0; iter < onBarValsTemp.length; iter++) {
                    onBarVals[iter] = 0;
                    schVals[iter] = 0;
                }
            }
            for (let iter = 0; iter < onBarValsTemp.length; iter++) {
                onBarVals[iter] += +onBarValsTemp[iter];
                schVals[iter] += +schValsTemp[iter];
            }
        }

        // now compute margin values
        const marginVals = [];
        for (let iter = 0; iter < onBarVals.length; iter++) {
            let dcVal = onBarVals[iter];
            let schVal = schVals[iter];
            let marginVal = +dcVal - +schVal;
            marginVal = (marginVal < 0) ? 0 : marginVal;
            marginVals.push(marginVal);
        }
        return callback(null, { 'margins': marginVals });
    }
    var tasksArray = [getDCOnbarSchArray, computeMargins];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            //console.log(err);
            return callback(err);
        }
        //console.log(resObj);
        return callback(null, resObj);
    });
}
