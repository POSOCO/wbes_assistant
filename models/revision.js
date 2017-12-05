/**
 * Created by Nagasudhir on 12/5/2017.
 */
var WBESUtils = require('../utils/wbesUtils');
var StrUtils = require('../utils/stringUtils');

module.exports.getRevisionsForDate = function (date_str, callback) {
    if (date_str == null) {
        // set it to today date
        var todayDate = new Date();
        date_str = StrUtils.makeTwoDigits(todayDate.getDate()) + "-" + StrUtils.makeTwoDigits(todayDate.getMonth() + 1) + "-" + todayDate.getFullYear();
    }
    WBESUtils.getRevisionsForDate(date_str, function (err, revisionsList) {
        if (err) {
            return callback(err);
        }
        callback(null, revisionsList);
    });
};