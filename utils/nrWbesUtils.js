/**
 * Created by Nagasudhir on 06/11/2018.
 */

var CSVFetcher = require('./csvFetcher');
var CSVToArray = require('./csvToArray');
var StringUtils = require('./stringUtils');
var ArrayHelper = require('../helpers/arrayHelpers');
var Cookie = require('cookie');
var async = require('async');

var baseUrl = module.exports.baseUrl = "https://wbes.nrldc.in";

var revisionsFetchUrl = module.exports.revisionsFetchUrl = "%s/Report/GetNetScheduleRevisionNoForSpecificRegion?regionid=3&ScheduleDate=%s";

// string parameters --> baseUrl, date_str, rev, seller_id
var isgsDeclarationFetchUrl = module.exports.isgsDeclarationFetchUrl = "%s/Report/GetDeclarationReport?regionId=3&date=%s&revision=%s&utilId=%s&isBuyer=0&byOnBar=1&byDCSchd=0"

// string parameters --> baseUrl, date_str, seller_id, rev, tokenStr
var sellerIsgsNetSchFetchUrl = module.exports.sellerIsgsNetSchFetchUrl = "%s/ReportFullSchedule/ExportFullScheduleInjSummaryToPDF?scheduleDate=%s&sellerId=%s&revisionNumber=%s&getTokenValue=%s&fileType=csv&regionId=3&byDetails=1&isDrawer=0&isBuyer=0"

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
            // baseUrl, date_str, rev, seller_id
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
    
                isgsDeclarationsArray[0] = row;
    
                callback(null, isgsDeclarationsArray);
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
        // baseUrl, date_str, seller_id, rev, tokenStr
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