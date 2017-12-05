/**
 * Created by Nagasudhir on 12/5/2017.
 */
var router = require('express').Router();
var WBESUtils = require("../utils/wbesUtils");

router.get('/surrenders', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var isSeller = req.query.is_seller;
    var dateStr = req.query.date_str;
    var fromBlk = req.query.from;
    var toBlk = req.query.to;
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

module.exports = router;