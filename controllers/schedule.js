/**
 * Created by Nagasudhir on 12/5/2017.
 */
var router = require('express').Router();
var WBESUtils = require("../utils/wbesUtils");
var Revision = require("../models/revision");
var Schedule = require("../models/schedule");

router.get('/surrenders', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var isSeller = req.query.is_seller;
    var dateStr = req.query.date_str;
    var fromBlk = req.query.from;
    var toBlk = req.query.to;
    fromBlk = Number(fromBlk);
    toBlk = Number(toBlk);
    var reqType = req.query.req_type;
    if (isSeller == 'true') {
        isSeller = true;
    }
    WBESUtils.getUtilISGSSurrenders(utilId, dateStr, rev, fromBlk, toBlk, reqType, isSeller, function (err, utilSurrObj) {
        if (err) {
            res.json({err: err});
            return;
        }
        res.json(utilSurrObj);
    });
});

router.get('/revisions', function (req, res) {
    var dateStr = req.query.date_str;
    Revision.getRevisionsForDate(dateStr, function (err, revList) {
        if (err) {
            res.json({err: err});
            return;
        }
        res.json({revisions: revList});
    });
});

router.get('/dc', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    Schedule.getIsgsDcObj(dateStr, rev, utilId, function (err, dcObj) {
        if (err) {
            res.json({err: err});
            return;
        }
        res.json(dcObj);
    });
});

router.get('/net_sch', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    var isSeller = req.query.is_seller;
    if (isSeller == 'true') {
        isSeller = true;
    }
    Schedule.getIsgsNetSchObj(utilId, dateStr, rev, isSeller, function (err, netSchObj) {
        if (err) {
            res.json({err: err});
            return;
        }
        res.json(netSchObj);
    });
});

router.get('/urs_summary', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    var fromBlk = Number(req.query.from);
    var toBlk = Number(req.query.to);
    Schedule.getISGSURSAvailedObj(dateStr, fromBlk, toBlk, rev, utilId, function (err, ursSummaryArray) {
        if (err) {
            res.json({err: err});
            return;
        }
        res.json({summary_array: ursSummaryArray});
    });
});

module.exports = router;