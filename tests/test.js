/**
 * Created by Nagasudhir on 12/03/2017.
 */

var chai = require('chai');
var should = chai.should();
var WBESUtils = require("../utils/wbesUtils");

var date_str = "21-11-2017";

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

    describe('get sellers and buyers list', function () {
        it('it should get all sellers & buyers for date ' + date_str, function (done) {
            // get the utilities
            WBESUtils.getUtilities(false, function (err, utilsObj) {
                if (err) {
                    console.log(err);
                    return done(err)
                }
                console.log("The buyers are ");
                var utilsStr = [];
                for (var i = 0; i < utilsObj["sellers"].length; i++) {
                    utilsStr.push(utilsObj["sellers"][i]["Acronym"]);
                }
                console.log(utilsStr.join(","));
                //console.log(Object.keys(utilsObj["buyers"][0]));
                done();
            });
        });
    });

    describe('get entitlements', function () {
        it('it should get and dump CSEB entitlement', function (done) {
            // get the entitlements of a utility for a date and a revision number
            WBESUtils.getBuyerEntitlement("20e8bfaf-8fb4-47c7-8522-5c208e3e270a", date_str, "10", function (err, entitlementsArray) {
                if (err) {
                    console.log(err);
                    return done(err)
                }
                // console.log(entitlementsArray);
                var fs = require('fs');
                fs.writeFile("test.txt", entitlementsArray.join('\n'), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The file was saved!");
                    done();
                });
            });
        });
    });

    describe('get requisitions', function () {
        it('it should get and dump CSEB requisitions', function (done) {
            //  get the ISGS Requisitions of a state
            WBESUtils.getBuyerISGSReq("20e8bfaf-8fb4-47c7-8522-5c208e3e270a", date_str, "10", function (err, isgsReqArray) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsReqArray);
                var fs = require('fs');
                fs.writeFile("dumps/req_test.csv", isgsReqArray.join('\n'), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                    done();
                });
            });
        });
    });
});