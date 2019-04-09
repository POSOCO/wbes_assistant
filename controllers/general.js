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

var getRevisionsNR = function (callback) {
    var todayDate = new Date();
    var date_str = StrUtils.makeTwoDigits(todayDate.getDate()) + "-" + StrUtils.makeTwoDigits(todayDate.getMonth() + 1) + "-" + todayDate.getFullYear();
    Revision.getNRRevisionsForDate(date_str, function (err, revList) {
        if (err) {
            console.log("error at getRevisions controller");
            return callback(err);
        }
        return callback(null, {'revisions': revList, date_str: date_str});
    });
};

var getEntUtils = function (resObj, callback) {
    Utility.getUtilities(true, function (err, utilsObj) {
        if (err) {
            console.log("error at getEntUtils controller");
            console.log(err);
            return callback(err);
        }
        resObj['utils'] = utilsObj;
        return callback(null, resObj);
    });
};

var getUtils = function (resObj, callback) {
    Utility.getUtilities(false, function (err, utilsObj) {
        if (err) {
            console.log("error at getUtils controller");
            console.log(err);
            return callback(err);
        }
        resObj['utils_net_sch'] = utilsObj;
        return callback(null, resObj);
    });
};

router.get('/home', function (req, res, next) {
    var tasksArray = [getRevisions, getEntUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('home', resObj);
    });
});

router.get('/isgs', function (req, res, next) {
    var tasksArray = [getRevisions, getEntUtils, getUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('dc', resObj);
    });
});

router.get('/margins_wr', function (req, res, next) {
    var tasksArray = [getRevisions, getEntUtils, getUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('margin', resObj);
    });
});

router.get('/rras', function (req, res, next) {
    var tasksArray = [getRevisions, getEntUtils, getUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('rras', resObj);
    });
});

router.get('/urs_summary', function (req, res, next) {
    var tasksArray = [getRevisions, getEntUtils, getUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('urs_summary', resObj);
    });
});

router.get('/margins_nr', function (req, res, next) {
    var tasksArray = [getRevisionsNR];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('margins_nr', resObj);
    });
});

router.get('/margins', function (req, res, next) {
    var tasksArray = [getRevisions, getEntUtils, getUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('margins_wr_v2', resObj);
    });
});

router.get('/sced_wr', function (req, res, next) {
    var tasksArray = [getRevisions, getEntUtils, getUtils];
    async.waterfall(tasksArray, function (err, resObj) {
        if (err) {
            return next(err);
        }
        res.render('sced_wr', resObj);
    });
});
module.exports = router;