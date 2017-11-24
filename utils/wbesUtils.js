/**
 * Created by Nagasudhir on 11/21/2017.
 */

var CSVFetcher = require('./csvFetcher');
var CSVToArray = require('./csvToArray');
var StringUtils = require('./stringUtils');
var Cookie = require('cookie');
var async = require('async');


var baseUrl = module.exports.baseUrl = "http://103.7.130.121";
var revisionsFetchUrl = module.exports.revisionsFetchUrl = "%s/wbes/Report/GetNetScheduleRevisionNoForSpecificRegion?regionid=2&ScheduleDate=%s";
var utilitiesFetchUrl = module.exports.utilitiesFetchUrl = "%s/wbes/ReportFullSchedule/GetUtils?regionId=2";
var entitlementsUtilitiesFetchUrl = module.exports.entitlementsUtilitiesFetchUrl = "%s/wbes/Report/GetUtils?regionId=2";
// string variables --> baseUrl, date_str, revisionNumber, util_id
var buyerEntitlementFetchUrl = module.exports.buyerEntitlementFetchUrl = "%s/wbes/Report/GetReportData?regionId=2&date=%s&revision=%s&utilId=%s&isBuyer=1&byOnBar=1";
// string parameters --> baseUrl, date_str, utilId, revNum, timestamp
var buyerISGSNetScheduleUrl = module.exports.buyerISGSNetScheduleUrl = "%s/wbes/ReportNetSchedule/ExportNetScheduleDetailToPDF?scheduleDate=%s&sellerId=%s&revisionNumber=%s&getTokenValue=%s&fileType=csv&schType=1";
// string parameters --> baseUrl, utilId, date_str, rev
var buyerISGSRequisitionUrl = module.exports.buyerISGSRequisitionUrl = "%s/wbes/Report/GetRldcData?isBuyer=true&utilId=%s&regionId=2&scheduleDate=%s&revisionNumber=%s&byOnBar=1";

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

var fetchCookiesFromReportsUrl = module.exports.fetchCookiesFromReportsUrl = function (callback) {
    var options = defaultRequestOptions;
    options.url = "http://103.7.130.121/wbes/";
    // get the cookies from response header
    CSVFetcher.doGetRequest(options, function (err, resBody, res) {
        if (err) {
            return callback(err);
        }
        console.log(res.headers['set-cookie']);
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

var getBuyerEntitlement = module.exports.getBuyerEntitlement = function (utilId, date_str, rev, callback) {
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
        options.url = StringUtils.parse(buyerEntitlementFetchUrl, baseUrl, date_str, rev, utilId);
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


var getBuyerISGSReq = module.exports.getBuyerISGSReq = function (utilId, date_str, rev, callback) {
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
        options.url = StringUtils.parse(buyerISGSRequisitionUrl, baseUrl, utilId, date_str, rev);
        console.log("Buyer ISGS Requisitions JSON fetch url created is " + options.url);

        // get the requisitions Array
        CSVFetcher.doGetRequest(options, function (err, resBody, res) {
            if (err) {
                return callback(err);
            }
            var isgsRequisitionsArray = JSON.parse(resBody)['jaggedarray'];

            // Remove the first row since it has the buyer name only
            isgsRequisitionsArray.splice(0,1);

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
                    row[i + 2] = row[i];
                }
            }
            isgsRequisitionsArray[0] = row;

            callback(null, isgsRequisitionsArray);
        });
    });
};