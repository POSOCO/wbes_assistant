/**
 * Created by Nagasudhir on 12/5/2017.
 */
var router = require('express').Router();
var Revision = require('../models/revision');
var Utility = require('../models/utility');
var StrUtils = require('../utils/stringUtils');
var async = require('async');

router.get('/', function (req, res) {
    res.redirect('/home');
});

router.get('/home', function (req, res, next) {
    var getRevisions = function (callback) {
        var todayDate = new Date();
        var date_str = StrUtils.makeTwoDigits(todayDate.getDate()) + "-" + StrUtils.makeTwoDigits(todayDate.getMonth() + 1) + "-" + todayDate.getFullYear();
        Revision.getRevisionsForDate(date_str, function (err, revList) {
            if (err) {
                console.log("error at getRevisions controller");
                return callback(err);
            }
            return callback(null, {'revisions': revList, date_str: date_str});
        });
    };

    var getUtils = function (resObj, callback) {
        Utility.getUtilities(true, function (err, utilsObj) {
            if (err) {
                console.log(err);
                return callback(err);
            }
            console.log("error at getUtils controller");
            resObj['utils'] = utilsObj;
            return callback(null, resObj);
        });
    };

    var tasksArray = [getRevisions, getUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('home', resObj);
    });
});

module.exports = router;