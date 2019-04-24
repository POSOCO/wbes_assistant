/**
 * Created by Nagasudhir on 12/5/2017.
 */
var router = require('express').Router();
var WBESUtils = require("../utils/wbesUtils");
var Revision = require("../models/revision");
var Schedule = require("../models/schedule");
var ScheduleNR = require("../models/schedule_nr");
var RatesModel = require("../models/rates");
var async = require('async');

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
            res.json({ err: err });
            return;
        }
        res.json(utilSurrObj);
    });
});

router.get('/revisions', function (req, res) {
    var dateStr = req.query.date_str;
    Revision.getRevisionsForDate(dateStr, function (err, revList) {
        if (err) {
            res.json({ err: err });
            return;
        }
        res.json({ revisions: revList });
    });
});

router.get('/revisions_nr', function (req, res) {
    var dateStr = req.query.date_str;
    Revision.getNRRevisionsForDate(dateStr, function (err, revList) {
        if (err) {
            res.json({ err: err });
            return;
        }
        res.json({ revisions: revList });
    });
});

router.get('/dc', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    Schedule.getIsgsDcObj(dateStr, rev, utilId, function (err, dcObj) {
        if (err) {
            res.json({ err: err });
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
            res.json({ err: err });
            return;
        }
        res.json(netSchObj);
    });
});

router.get('/net_sch_for_dates', function (req, res) {
    var utilId = req.query.util_id;
    var fromDateStr = req.query.from_date_str;
    var toDateStr = req.query.to_date_str;
    var isSeller = req.query.is_seller;
    if (isSeller == 'true') {
        isSeller = true;
    }
    var makeTwoDigits = function (num) {
        if (num < 10) {
            return '0' + num;
        } else {
            return num;
        }
    }
    var fromDateFrags = fromDateStr.split('-').map(Number);
    var toDateFrags = toDateStr.split('-').map(Number);
    var fromDate = new Date(fromDateFrags[2], fromDateFrags[1] - 1, fromDateFrags[0]);
    var toDate = new Date(toDateFrags[2], toDateFrags[1] - 1, toDateFrags[0]);
    var daysDiff = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
    var reqDatesList = [];
    for (let dayCounter = 0; dayCounter <= daysDiff; dayCounter++) {
        var reqDate = new Date(fromDate.getTime() + dayCounter * (1000 * 60 * 60 * 24))
        reqDatesList.push(reqDate);
    }

    // https://stackoverflow.com/questions/20882892/pass-extra-argument-to-async-map
    var getNetSchForDate = function (reqDate, callback) {
        var dateStr = makeTwoDigits(reqDate.getDate()) + "-" + makeTwoDigits(reqDate.getMonth() + 1) + '-' + reqDate.getFullYear();
        var utilId = this.utilId;
        var isSeller = this.isSeller;
        Revision.getMaxRevisionForDate(dateStr, function (err, maxRev) {
            if (err) {
                return callback(err);
            }
            Schedule.getIsgsNetSchObj(utilId, dateStr, maxRev, isSeller, function (err, netSchObj) {
                if (err) {
                    return callback(err);
                }
                netSchObj['date'] = reqDate;
                callback(null, netSchObj);
            });
        });
    }

    async.mapSeries(reqDatesList, getNetSchForDate.bind({ "utilId": utilId, "isSeller": isSeller }), function (err, results) {
        // console.log(results);
        // combine all results to get a single array
        if (err) {
            return callback(err);
        }
        if (results.length == 0) {
            return callback(new Error("No data returned from server..."));
        }
        var schObj = {};
        schObj['gen_names'] = results[0]['gen_names'];
        schObj['times'] = [];
        const schTypes = Object.keys(results[0][schObj['gen_names'][0]]);
        for (let genIter = 0; genIter < schObj['gen_names'].length; genIter++) {
            const genName = schObj['gen_names'][genIter];
            schObj[genName] = {};
            for (let schTypeIter = 0; schTypeIter < schTypes.length; schTypeIter++) {
                schObj[genName][schTypes[schTypeIter]] = [];
            }
        }
        for (let resIter = 0; resIter < results.length; resIter++) {
            // derive and append time values to resultant schedule object
            const daySch = results[resIter];
            const day = daySch['date'];
            const dayTimeVals = [];
            for (let blkIter = 0; blkIter < 96; blkIter++) {
                dayTimeVals.push(new Date(day.getTime() + blkIter * 15 * 60 * 1000));
            }
            schObj['times'].push(...dayTimeVals);
            // append schedules to resultant object
            for (let genIter = 0; genIter < daySch['gen_names'].length; genIter++) {
                const genName = daySch['gen_names'][genIter];
                for (let schTypeIter = 0; schTypeIter < schTypes.length; schTypeIter++) {
                    const schType = schTypes[schTypeIter];
                    schObj[genName][schType].push(...daySch[genName][schType]);
                }
            }
        }
        res.json(schObj);
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
            res.json({ err: err });
            return;
        }
        res.json({ summary_array: ursSummaryArray });
    });
});

router.get('/dc_nr', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    ScheduleNR.getIsgsDcObj(dateStr, rev, utilId, function (err, dcObj) {
        if (err) {
            res.json({ err: err });
            return;
        }
        res.json(dcObj);
    });
});

router.get('/net_sch_nr', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    var isSeller = req.query.is_seller;
    if (isSeller == 'true') {
        isSeller = true;
    }
    ScheduleNR.getIsgsNetSchObj(utilId, dateStr, rev, isSeller, function (err, netSchObj) {
        if (err) {
            res.json({ err: err });
            return;
        }
        res.json(netSchObj);
    });
});

router.get('/margins', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    var isSeller = req.query.is_seller;
    if (isSeller == 'true') {
        isSeller = true;
    }
    Schedule.getISGSDCSchObj(utilId, dateStr, rev, function (err, dcSchObj) {
        if (err) {
            res.json({ err: err });
            return;
        }
        // create margins also from the dc sch of each generator
        const gen_names = dcSchObj['gen_names'];
        const time_blocks = dcSchObj['time_blocks'];
        for (let genIter = 0; genIter < gen_names.length; genIter++) {
            const genName = gen_names[genIter];
            const onBarVals = dcSchObj[genName]['on_bar_dc'];
            const schVals = dcSchObj[genName]['total'];
            let marginVals = [];
            //todo check if dimensions of onBarVals and schVals are same
            for (let blkIter = 0; blkIter < onBarVals.length; blkIter++) {
                let marginVal = +onBarVals[blkIter] - +schVals[blkIter];
                marginVal = (marginVal < 0) ? 0 : marginVal;
                marginVals.push(marginVal);
            }
            dcSchObj[genName]['margin'] = marginVals;
        }
        res.json(dcSchObj);
    });
});

router.get('/sced', function (req, res) {
    var utilId = req.query.util_id;
    var rev = req.query.rev;
    var dateStr = req.query.date_str;
    var isSeller = req.query.is_seller;
    if (isSeller == 'true') {
        isSeller = true;
    }
    Schedule.getIsgsNetSchObj(utilId, dateStr, rev, isSeller, function (err, netSchObj) {
        if (err) {
            res.json({ err: err });
            return;
        }
        scedObj = {};
        scedObj['gen_names'] = netSchObj['gen_names'];
        scedObj['time_blocks'] = netSchObj['time_blocks'];
        const gen_names = netSchObj['gen_names'];
        for (let genIter = 0; genIter < gen_names.length; genIter++) {
            const genName = gen_names[genIter];
            scedObj[genName] = {};
            scedObj[genName]['sced'] = netSchObj[genName]['sced'];
        }
        res.json(scedObj);
    });
});

router.post('/rates_wr', function (req, res) {
    var ratesObj = req.body;
    //console.log("rates for saving is " + ratesObj);
    RatesModel.setVariableCosts(ratesObj, function (err, ratesObj) {
        if (err) {
            // console.log(err);
            res.json({ err: err });
            return;
        }
        console.log("rates json object was saved successfully...");
        //console.log(ratesObj);
        res.json({ "message": "saved...", ratesObj });
    });
});

router.get('/rates_wr', function (req, res) {
    //  get the variable costs
    RatesModel.getVariableCosts(function (err, ratesObj) {
        if (err) {
            res.json({ err: err });
            return;
        }
        //console.log("rates json object was read successfully...");
        //console.log(ratesObj);
        res.json(ratesObj);
    });
});

module.exports = router;