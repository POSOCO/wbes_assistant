/**
 * Created by Nagasudhir on 06/11/2018.
 */

var chai = require('chai');
var should = chai.should();
var WBESUtils = require("../utils/nrWbesUtils");
var SchedulesModel = require("../models/schedule");

var date_str = "11-06-2018";

describe('WBES Schedules', function () {
    beforeEach(function (done) {
        // do nothing
        done();
    });

    describe('get revisions', function () {
        it('it should get all revisions for date ' + date_str, function (done) {
            // get the revision Number for Date
            WBESUtils.getRevisionsForDate(date_str, function (err, revisionsArray) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                console.log("The revision numbers for date " + date_str + " are " + revisionsArray);
                done();
            });
        });
    });

    describe('get full sch of ALL NR ISGS', function () {

        it('it should get and dump all NR ISGS DC json', function (done) {
            //  get all NR ISGS DC json
            WBESUtils.getISGSDeclarationsArray(date_str, "10", "ALL", function (err, isgsDcObj) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsDcObj);
                var fs = require('fs');
                fs.writeFile("dumps/nr_isgs_dc_test.json", JSON.stringify(isgsDcObj), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The file nr_isgs_dc_test.json was saved!");
                    done();
                });
            });
        });

        it('it should get and dump all NR ISGS Full Sch', function (done) {
            //  get the ALL ISGS Full Sch matrix
            WBESUtils.getUtilISGSNetSchedules("ALL", date_str, "10", true, function (err, isgsNetSchedulesArray) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsNetSchedulesArray);
                var fs = require('fs');
                fs.writeFile("dumps/nr_isgs_net_sch_test.csv", isgsNetSchedulesArray.join('\n'), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The file nr_isgs_net_sch_test.csv was saved!");
                    done();
                });
            });
        });
    });

});