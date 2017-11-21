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
// string variables --> baseUrl, date_str, revisionNumber, util_id
var buyerEntitlementFetchUrl = module.exports.buyerEntitlementFetchUrl = "%s/wbes/Report/GetReportData?regionId=2&date=%s&revision=%s&utilId=%s&isBuyer=1&byOnBar=1";
// string parameters --> baseUrl, date_str, utilId, revNum, timestamp
var buyerISGSNetScheduleUrl = module.exports.buyerISGSNetScheduleUrl = "%s/wbes/ReportNetSchedule/ExportNetScheduleDetailToPDF?scheduleDate=%s&sellerId=%s&revisionNumber=%s&getTokenValue=%s&fileType=csv&schType=1";

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

var getUtilities = module.exports.getUtilities = function (callback) {
    var options = defaultRequestOptions;
    options.url = StringUtils.parse(utilitiesFetchUrl, baseUrl);
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
            callback(null, isgsNetSchedulesArray);
        });
    });
};