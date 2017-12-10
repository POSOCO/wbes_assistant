/**
 * Created by Nagasudhir on 12/10/2017.
 */

var chai = require('chai');
var should = chai.should();
var WBESUtils = require("../utils/wbesUtils");
var SchedulesModel = require("../models/schedule");

var date_str = "21-11-2017";

describe('WBES DC', function () {
    beforeEach(function (done) {
        // do nothing
        done();
    });


    describe('get DC of ISGS', function () {
        it('it should get and dump VSTPS-V DC', function (done) {
            //  get the VSTPS-V DC matrix
            WBESUtils.getISGSDeclarationsArray(date_str, "10", "5df201ba-1574-475a-ad25-b26533170943", function (err, isgsDcArray) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsDcArray);
                var fs = require('fs');
                fs.writeFile("dumps/isgs_dc_test.csv", isgsDcArray.join('\n'), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The file isgs_dc_test.csv was saved!");
                    done();
                });
            });
        });

        it('it should get and dump VSTPS-V DC json', function (done) {
            //  get the VSTPS-V DC json
            SchedulesModel.getIsgsDcObj(date_str, "10", "5df201ba-1574-475a-ad25-b26533170943", function (err, isgsDcObj) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsDcObj);
                var fs = require('fs');
                fs.writeFile("dumps/isgs_dc_test.json", JSON.stringify(isgsDcObj), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The file isgs_dc_test.json was saved!");
                    done();
                });
            });
        });

        it('it should get and dump VSTPS-V Full Schedules', function (done) {
            //  get the VSTPS-V Full sch matrix
            WBESUtils.getUtilISGSNetSchedules("5df201ba-1574-475a-ad25-b26533170943", date_str, "10", true, function (err, isgsNetSchedulesArray) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsNetSchedulesArray);
                var fs = require('fs');
                fs.writeFile("dumps/test_isgs_full_sch.csv", isgsNetSchedulesArray.join('\n'), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The file test_isgs_full_sch.csv was saved!");
                    done();
                });
            });
        });

        it('it should get and dump VSTPS-V Full Schedules json', function (done) {
            //  get the VSTPS-V Full sch json 5df201ba-1574-475a-ad25-b26533170943
            SchedulesModel.getIsgsNetSchObj("ALL", date_str, "10", true, function (err, isgsNetSchobj) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsNetSchobj);
                var fs = require('fs');
                fs.writeFile("dumps/test_isgs_full_sch.json", JSON.stringify(isgsNetSchobj), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The file test_isgs_full_sch.json was saved!");
                    done();
                });
            });
        });
    });
});