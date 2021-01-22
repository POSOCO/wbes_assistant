/**
 * Created by Nagasudhir on 11/21/2017.
 */

var CSVFetcher = require('./csvFetcher');
var CSVToArray = require('./csvToArray');
var StringUtils = require('./stringUtils');
var ArrayHelper = require('../helpers/arrayHelpers');
var Cookie = require('cookie');
var async = require('async');


var baseUrl = module.exports.baseUrl = "https://wbes.wrldc.in";
var revisionsFetchUrl = module.exports.revisionsFetchUrl = "%s/Report/GetNetScheduleRevisionNoForSpecificRegion?regionid=2&ScheduleDate=%s";
var maxRevisionFetchUrl = module.exports.maxRevisionFetchUrl = "%s/Report/GetCurrentDayFullScheduleMaxRev?regionid=2&ScheduleDate=%s";
var utilitiesFetchUrl = module.exports.utilitiesFetchUrl = "%s/ReportFullSchedule/GetUtils?regionId=2";
var entitlementsUtilitiesFetchUrl = module.exports.entitlementsUtilitiesFetchUrl = "%s/Report/GetUtils?regionId=2";
// string variables --> baseUrl, date_str, rev, util_id
var buyerISGSEntitlementFetchUrl = module.exports.buyerEntitlementFetchUrl = "%s/Report/GetReportData?regionId=2&date=%s&revision=%s&utilId=%s&isBuyer=1&byOnBar=1";
// string parameters --> baseUrl, date_str, utilId, revNum, timestamp
var buyerISGSNetScheduleUrl = module.exports.buyerISGSNetScheduleUrl = "%s/ReportNetSchedule/ExportNetScheduleDetailToPDF?scheduleDate=%s&sellerId=%s&revisionNumber=%s&getTokenValue=%s&fileType=csv&schType=1";
// string parameters --> baseUrl, utilId, date_str, rev
var buyerISGSRequisitionUrl = module.exports.buyerISGSRequisitionUrl = "%s/Report/GetRldcData?isBuyer=true&utilId=%s&regionId=2&scheduleDate=%s&revisionNumber=%s&byOnBar=1";
// string parameters --> baseUrl, date_str, rev, utilId
var sellerISGSEntitlementFetchUrl = module.exports.sellerISGSEntitlementFetchUrl = "%s/Report/GetReportData?regionId=2&date=%s&revision=%s&utilId=%s&isBuyer=0&byOnBar=1";
// string parameters --> baseUrl, utilId, date_str, rev
var sellerISGSRequisitionUrl = module.exports.sellerISGSRequisitionUrl = "%s/Report/GetRldcData?isBuyer=false&utilId=%s&regionId=2&scheduleDate=%s&revisionNumber=%s&byOnBar=1";
// string parameters --> baseUrl, date_str, rev, utilId
var isgsDeclarationFetchUrl = module.exports.isgsDeclarationFetchUrl = "%s/Report/GetDeclarationReport?regionId=2&date=%s&revision=%s&utilId=%s&isBuyer=0&byOnBar=1&byDCSchd=0";
// string parameters --> baseUrl, date_str, rev, utilId
var isgsOnbarSchFetchUrl = module.exports.isgsOnbarSchFetchUrl = "%s/Report/GetDeclarationReport?regionId=2&date=%s&revision=%s&utilId=%s&isBuyer=0&byOnBar=1&byDCSchd=1";
// string parameters --> baseUrl, date_str, utilId, rev, timestamp
var sellerIsgsNetSchFetchUrl = module.exports.sellerIsgsNetSchFetchUrl = "%s/ReportFullSchedule/ExportFullScheduleInjSummaryToPDF?scheduleDate=%s&sellerId=%s&revisionNumber=%s&getTokenValue=%s&fileType=csv&regionId=2&byDetails=1&isDrawer=0&isBuyer=0";
var buyerIsgsNetSchFetchUrl = module.exports.buyerIsgsNetSchFetchUrl = "%s/ReportFullSchedule/ExportFullScheduleInjSummaryToPDF?scheduleDate=%s&sellerId=%s&revisionNumber=%s&getTokenValue=%s&fileType=csv&regionId=2&byDetails=1&isDrawer=0&isBuyer=1";
// string parameters --> baseUrl, date_str, rev, utilId
var isgsURSAvailedFetchUrl = module.exports.isgsURSAvailedFetchUrl = "%s/Report/GetUrsReport?regionId=2&date=%s&revision=%s&utilId=%s&isBuyer=0&byOnReg=0";

// Default Request headers
var defaultRequestHeaders = module.exports.defaultRequestHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
    'Accept-Encoding': 'gzip, deflate'
};

// Default request options
var defaultRequestOptions = module.exports.defaultRequestOptions = {
    url: "",
    method: 'GET',
    headers: defaultRequestHeaders
};

// Utility function - gets legitimate start and end blocks from inputs. Any wrong inputs will return 1, 96
var getStartEndBlks = module.exports.getStartEndBlks = function (fromBlk, toBlk) {
    var startBlk = 1;
    var endBlk = 96;
    if (fromBlk != null && !isNaN(fromBlk) && fromBlk <= 96 && fromBlk >= 1) {
        startBlk = fromBlk;
    }
    if (toBlk != null && !isNaN(toBlk) && toBlk <= 96 && toBlk >= 1) {
        endBlk = toBlk;
    }
    if (startBlk > endBlk) {
        startBlk = 1;
        endBlk = 96;
    }
    return {startBlk: startBlk, endBlk: endBlk};
};

var fetchCookiesFromReportsUrl = module.exports.fetchCookiesFromReportsUrl = function (callback) {
    var options = defaultRequestOptions;
    options.url = baseUrl;
    // get the cookies from response header
    CSVFetcher.doGetRequest(options, function (err, resBody, res) {
        if (err) {
            return callback(err);
        }
        // console.log(res.headers['set-cookie']);
        callback(null, res.headers['set-cookie']);
    });
};

var getRevisionsForDate = module.exports.getRevisionsForDate = function (date_str, callback) {
    var options = defaultRequestOptions;
    options.url = StringUtils.parse(revisionsFetchUrl, baseUrl, date_str);
    // get the list of revision numbers
    CSVFetcher.doGetRequest(options, function (err, resBody, res) {
        if (err) {
            return callback(err);
        }
        var revisionsList = JSON.parse(resBody);
        callback(null, revisionsList);
    });
};

// http://scheduling.wrldc.in/wbes/Report/GetCurrentDayFullScheduleMaxRev?regionid=2&ScheduleDate=24-04-2019
var getMaxRevisionForDate = module.exports.getMaxRevisionForDate = function (date_str, callback) {
    var options = defaultRequestOptions;
    options.url = StringUtils.parse(maxRevisionFetchUrl, baseUrl, date_str);
    // get the list of revision numbers
    CSVFetcher.doGetRequest(options, function (err, resBody, res) {
        if (err) {
            return callback(err);
        }
        var maxRev = JSON.parse(resBody)['MaxRevision'];
        callback(null, maxRev);
    });
};

var getUtilities = module.exports.getUtilities = function (forEnt, callback) {
    var options = defaultRequestOptions;
    if (forEnt) {
        options.url = StringUtils.parse(entitlementsUtilitiesFetchUrl, baseUrl);
    } else {
        options.url = StringUtils.parse(utilitiesFetchUrl, baseUrl);
    }
    // get the list of utilities
    CSVFetcher.doGetRequest(options, function (err, resBody, res) {
        if (err) {
            return callback(err);
        }
        var utilitiesObj = JSON.parse(resBody);
        callback(null, utilitiesObj);
    });
};

var getUtilEntitlement = module.exports.getUtilEntitlement = function (utilId, date_str, rev, isSeller, callback) {
    // fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            fetchCookiesFromReportsUrl(function (err, cookieObj) {
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
        var options = defaultRequestOptions;

        // var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        //cookieString += ";fileDownloadToken=" + tokenString;
        options.headers.cookie = cookieString;
        console.log("Cookie String for buyer entitlement is " + cookieString);
        var urlTemplate = buyerISGSEntitlementFetchUrl;
        if (isSeller == true) {
            urlTemplate = sellerISGSEntitlementFetchUrl;
        }
        options.url = StringUtils.parse(urlTemplate, baseUrl, date_str, rev, utilId);
        console.log("Buyer JSON Entitlement fetch url created is " + options.url);
        // get the entitlements Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var entitlementsArray = JSON.parse(resBody)['jaggedarray'];
            // remove the revision number from the gen name
            var row = entitlementsArray[0];
            for (var i = 0; i < row.length; i++) {
                var bracketIndex = row[i].indexOf("(");
                if (bracketIndex != -1) {
                    row[i] = row[i].substring(0, bracketIndex);
                }
            }
            // duplicate the gen Name across the whole row. The gen Name is above OffBarEnt header
            var secondRow = entitlementsArray[1];
            for (var i = 0; i < secondRow.length; i++) {
                if (secondRow[i] == "OffBarEnt") {
                    // duplicate the name in other headers too
                    row[i - 1] = row[i];
                    row[i + 1] = row[i];
                    row[i + 2] = row[i];
                }
            }
            entitlementsArray[0] = row;
            callback(null, entitlementsArray);
        });
    });
};

var getBuyerISGSNetSchedules = module.exports.getBuyerISGSNetSchedules = function (utilId, date_str, rev, callback) {
    // fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            fetchCookiesFromReportsUrl(function (err, cookieObj) {
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
        var options = defaultRequestOptions;

        var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        // options.headers.cookie = cookieString;
        console.log("Cookie String for buyer isgs net schedules is " + cookieString);
        options.url = StringUtils.parse(buyerISGSNetScheduleUrl, baseUrl, date_str, utilId, rev, tokenString);
        console.log("Buyer ISGS Net schedules CSV fetch url created is " + options.url);
        // get the net schedules Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsNetSchedulesArray = CSVToArray.csvToArray(resBody.replace(/\0/g, ''));
            // the row with 1st column value as "From Utility" will be the generator header
            // The row with 1st column value as 1 will be 1st block value and row with value 96 will be 96 block value
            // find the generator Row
            var genRow, firstBlkRow = -1;
            for (var i = 0; i < isgsNetSchedulesArray.length; i++) {
                if (isgsNetSchedulesArray[i][0] == "From Utility") {
                    genRow = i;
                    break;
                }
            }
            if (genRow != -1) {
                for (var i = genRow; i < isgsNetSchedulesArray.length; i++) {
                    if (isgsNetSchedulesArray[i][0] == "1") {
                        firstBlkRow = i;
                        break;
                    }
                }
            }
            var newNetSchArray = [];
            if (genRow != -1 && firstBlkRow != -1) {
                newNetSchArray.push(isgsNetSchedulesArray[genRow]);
                for (var i = 0; i < 96; i++) {
                    newNetSchArray.push(isgsNetSchedulesArray[firstBlkRow + i]);
                }
            }
            callback(null, newNetSchArray);
        });
    });
};


var getUtilISGSNetSchedules = module.exports.getUtilISGSNetSchedules = function (utilId, date_str, rev, isSeller, callback) {
    // fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            fetchCookiesFromReportsUrl(function (err, cookieObj) {
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
        var options = defaultRequestOptions;

        var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        // options.headers.cookie = cookieString;
        console.log("Cookie String for util isgs net schedules is " + cookieString);
        var templateUrl = sellerIsgsNetSchFetchUrl;
        if (isSeller != true) {
            templateUrl = buyerIsgsNetSchFetchUrl;
        }
        options.url = StringUtils.parse(templateUrl, baseUrl, date_str, utilId, rev, tokenString);
        console.log("Util ISGS Net schedules CSV fetch url created is " + options.url);
        // get the net schedules Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsNetSchedulesArray = CSVToArray.csvToArray(resBody.replace(/\0/g, ''));
            callback(null, isgsNetSchedulesArray);
        });
    });
};


var getUtilISGSReq = module.exports.getUtilISGSReq = function (utilId, date_str, rev, isSeller, callback) {
    // http://103.7.130.121/wbes/Report/GetRldcData?isBuyer=true&utilId=20e8bfaf-8fb4-47c7-8522-5c208e3e270a&regionId=2&scheduleDate=24-11-2017&revisionNumber=35&byOnBar=1
    // fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            fetchCookiesFromReportsUrl(function (err, cookieObj) {
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
        var options = defaultRequestOptions;

        var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        // options.headers.cookie = cookieString;
        console.log("Cookie String for buyer isgs requisitions is " + cookieString);
        var templateUrl = buyerISGSRequisitionUrl;
        if (isSeller == true) {
            templateUrl = sellerISGSRequisitionUrl;
        }
        options.url = StringUtils.parse(templateUrl, baseUrl, utilId, date_str, rev);
        console.log("Buyer ISGS Requisitions JSON fetch url created is " + options.url);

        // get the requisitions Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsRequisitionsArray = JSON.parse(resBody)['jaggedarray'];

            // Remove the first row since it has the buyer name only
            isgsRequisitionsArray.splice(0, 1);

            // remove the revision number from the gen name
            var row = isgsRequisitionsArray[0];
            for (var i = 0; i < row.length; i++) {
                var bracketIndex = row[i].indexOf("(");
                if (bracketIndex != -1) {
                    row[i] = row[i].substring(0, bracketIndex);
                }
            }

            // duplicate the gen Name across the whole row. The gen Name is above OffBarEnt header
            var secondRow = isgsRequisitionsArray[1];
            for (var i = 0; i < secondRow.length; i++) {
                if (secondRow[i] == "OffBarReq") {
                    // duplicate the name in other headers too
                    row[i - 1] = row[i];
                    row[i + 1] = row[i];
                }
            }
            isgsRequisitionsArray[0] = row;

            callback(null, isgsRequisitionsArray);
        });
    });
};

// get the array of surrenders by the constituent in all the ISGS generators
var getUtilISGSSurrenders = module.exports.getUtilISGSSurrenders = function (utilId, date_str, rev, fromBlk, toBlk, reqType, isSeller, callback) {
    var tempObj = getStartEndBlks(fromBlk, toBlk);
    var startBlk = tempObj.startBlk;
    var endBlk = tempObj.endBlk;

    var onBarReqHeading = 'onbarreq';
    var offBarReqHeading = 'offbarreq';
    var totalReqHeading = 'total';
    var onBarEntHeading = 'onbarent';
    var offBarEntHeading = 'offbarent';
    var totalEntHeading = 'total ent';
    var entTypeSearchStr = totalEntHeading;
    var reqTypeSearchStr = totalReqHeading;
    if (typeof reqType == 'string') {
        if (reqType.toLowerCase() == 'onbar') {
            entTypeSearchStr = onBarEntHeading;
            reqTypeSearchStr = onBarReqHeading;
        }
        if (reqType.toLowerCase() == 'offbar') {
            entTypeSearchStr = offBarEntHeading;
            reqTypeSearchStr = offBarReqHeading;
        }
        if (reqType.toLowerCase() == 'total') {
            entTypeSearchStr = totalEntHeading;
            reqTypeSearchStr = totalReqHeading;
        }
    }

    /*
     Steps:
     Get the ISGS entitlements array
     Get the ISGS requisitions array
     For each generator in entitlements, get the corresponding requisitions
     Check if there is surrender in the required category (Onbar, Offbar, Total) of the generator
     */
    var getUtilEntsArray = function (callback) {
        getUtilEntitlement(utilId, date_str, rev, isSeller, function (err, utilEntsArray) {
            if (err) {
                return callback(err);
            }
            return callback(null, {'entitlementsMatrix': utilEntsArray});
        });
    };

    var getUtilReqsArray = function (resObj, callback) {
        getUtilISGSReq(utilId, date_str, rev, isSeller, function (err, utilReqsArray) {
            if (err) {
                return callback(err);
            }
            resObj['requisitionsMatrix'] = utilReqsArray;
            return callback(null, resObj);
        });
    };

    var tasksArray = [getUtilEntsArray, getUtilReqsArray];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return callback(err);
        }
        // now we have buyer entitlements and requisitions array in the resObj object
        var entsMatrix = resObj['entitlementsMatrix'];
        var reqMatrix = resObj['requisitionsMatrix'];

        // Check entsMatrix and reqMatrix is a square matrix of atleast 98 rows and 3 columns
        var entsMatrixDim = ArrayHelper.getDim(entsMatrix);
        var reqMatrixDim = ArrayHelper.getDim(reqMatrix);
        if (entsMatrix.length < 2 || entsMatrix[0] < 98 || entsMatrix[1] < 3) {
            return callback(new Error('Entitlements matrix is not of minimum required shape of 98*3'));
        }
        if (reqMatrix.length < 2 || reqMatrix[0] < 98 || reqMatrix[1] < 3) {
            return callback(new Error('Requisitions matrix is not of minimum required shape of 98*3'));
        }

        var entsFirstRow = entsMatrix[0];
        var entsSecRow = entsMatrix[1];
        var reqFirstRow = reqMatrix[0];
        var reqSecRow = reqMatrix[1];

        // first row will have the generator names. Exclude Time block and Block number columns from search
        var genNames = ArrayHelper.getUniqueList(entsFirstRow.slice(2));

        // console.log(genNames);
        // console.log(entTypeSearchStr + "  " + reqTypeSearchStr);

        // initialize the surrendersObj
        var surrendersObj = {utilNames: [], reqType: reqTypeSearchStr, blks: []};
        for (var i = 0; i < genNames.length; i++) {
            var genName = genNames[i].trim();
            var entMatrixGenIndices = ArrayHelper.getAllIndexesOfVal(entsFirstRow, genName, true);
            var reqMatrixGenIndices = ArrayHelper.getAllIndexesOfVal(reqFirstRow, genName, true);

            // console.log('entMatrixGenIndices ' + entMatrixGenIndices);
            // console.log('reqMatrixGenIndices ' + reqMatrixGenIndices);

            var desiredEntCol = -1;

            for (var k = 0; k < entMatrixGenIndices.length; k++) {
                // check for desired requisition type in second row
                if (entsSecRow[entMatrixGenIndices[k]].toLowerCase().trim() == entTypeSearchStr) {
                    desiredEntCol = entMatrixGenIndices[k];
                }
            }

            if (desiredEntCol == -1) {
                // return callback(new Error('Could not find the generator name in the Entitlements array'));
                continue;
            }

            var desiredReqCol = -1;

            for (var k = 0; k < reqMatrixGenIndices.length; k++) {
                // check for desired requisition type in second row
                if (reqSecRow[reqMatrixGenIndices[k]].toLowerCase().trim() == reqTypeSearchStr) {
                    desiredReqCol = reqMatrixGenIndices[k];
                }
            }

            if (desiredReqCol == -1) {
                //return callback(new Error('Could not find the generator name in the Requisitions array'));
                continue;
            }

            // todo find block index offset explicitly from the time block column
            var blkIndexOffset = 1;
            var surrenderBlks = [];
            var surrReqArray = [];
            var epsilon = 0.1;
            for (var blk = startBlk; blk <= endBlk; blk++) {
                var blkIndex = blk + blkIndexOffset;
                var req = Number(reqMatrix[blkIndex][desiredReqCol]);
                var ent = Number(entsMatrix[blkIndex][desiredEntCol]);
                if (ent - req > epsilon) {
                    surrenderBlks.push(blk);
                    surrReqArray.push({blk: blk, req: req, ent: ent})
                }
            }

            if (surrenderBlks.length > 0) {
                // there is surrender in this generator
                surrendersObj.utilNames.push(genName);
                surrendersObj.blks.push({utilName: genName, values: surrReqArray});
            }

        }
        return callback(null, surrendersObj);
    });
};

// get ISGS declarations for a date, rev, utilId
var getISGSDeclarationsArray = module.exports.getISGSDeclarationsArray = function (date_str, rev, utilId, callback) {
// fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            fetchCookiesFromReportsUrl(function (err, cookieObj) {
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
        var options = defaultRequestOptions;

        var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        // options.headers.cookie = cookieString;
        console.log("Cookie String for buyer isgs declaration is " + cookieString);
        var templateUrl = isgsDeclarationFetchUrl;
        options.url = StringUtils.parse(templateUrl, baseUrl, date_str, rev, utilId);
        console.log("ISGS Declaration JSON fetch url created is " + options.url);

        // get the declarations Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsDeclarationsArray = JSON.parse(resBody)['jaggedarray'];

            // remove the revision number from the gen name
            var row = isgsDeclarationsArray[0];
            for (var i = 0; i < row.length; i++) {
                var bracketIndex = row[i].indexOf("(");
                if (bracketIndex != -1) {
                    row[i] = row[i].substring(0, bracketIndex);
                }
            }

            // duplicate the gen Name across the whole row. The gen Name is above OffBarDC header
            var secondRow = isgsDeclarationsArray[1];
            for (var i = 0; i < secondRow.length; i++) {
                if (secondRow[i] == "OffBarDC") {
                    // duplicate the name in other headers too
                    row[i - 1] = row[i];
                    row[i + 1] = row[i];
                }
            }
            isgsDeclarationsArray[0] = row;

            callback(null, isgsDeclarationsArray);
        });
    });
};

// get ISGS URS Availed for a date, rev, utilId
var getISGSURSAvailedArray = module.exports.getISGSURSAvailedArray = function (date_str, rev, utilId, callback) {
// fetch cookie first and then do request
    async.waterfall([
        function (callback) {
            fetchCookiesFromReportsUrl(function (err, cookieObj) {
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
        var options = defaultRequestOptions;

        var tokenString = new Date().getTime();
        var cookieString = "";
        cookieString += cookieObj[0];
        // options.headers.cookie = cookieString;
        console.log("Cookie String for buyer isgs declaration is " + cookieString);
        var templateUrl = isgsURSAvailedFetchUrl;
        options.url = StringUtils.parse(templateUrl, baseUrl, date_str, rev, utilId);
        console.log("ISGS URS Availed JSON fetch url created is " + options.url);

        // get the declarations Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsURSAvailedArray = JSON.parse(resBody)['jaggedarray'];

            // remove the revision number from the beneficiary name
            var row = isgsURSAvailedArray[1];
            for (var i = 0; i < row.length; i++) {
                var bracketIndex = row[i].indexOf("(");
                if (bracketIndex != -1) {
                    row[i] = row[i].substring(0, bracketIndex);
                }
            }
            isgsURSAvailedArray[1] = row;

            callback(null, isgsURSAvailedArray);
        });
    });
};