/**
 * Created by Nagasudhir on 12/5/2017.
 */
var router = require('express').Router();
var WBESUtils = require("../utils/wbesUtils");
var Revision = require("../models/revision");
var ArrayHelper = require('../helpers/arrayHelpers');

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
    WBESUtils.getISGSDeclarations(dateStr, rev, utilId, function (err, dcMatrixArray) {
        if (err) {
            res.json({err: err});
            return;
        }
        var dcMatrixDim = ArrayHelper.getDim(dcMatrixArray);
        if (dcMatrixDim.length < 2 || dcMatrixDim[0] < 98 || dcMatrixDim[1] < 3) {
            res.json({err: 'DC matrix is not of minimum required shape of 98*3'});
            return;
        }
        res.json({dc_matrix: dcMatrixArray});
    });
});


module.exports = router;