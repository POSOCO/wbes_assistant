/**
 * Created by Nagasudhir on 12/5/2017.
 */
var router = require('express').Router();
var Revision = require('../models/revision');
var Utility = require('../models/utility');
var async = require('async');

router.get('/', function (req, res) {
    res.redirect('/home');
});

router.get('/home', function (req, res, next) {
    var getRevisions = function (callback) {
        Revision.getRevisionsForDate(null, function (err, revList) {
            if (err) {
                console.log("error at getRevisions controller");
                return callback(err);
            }
            return callback(null, {'revisions': revList});
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