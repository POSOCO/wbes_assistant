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

    describe('get buyer entitlements', function () {
        it('it should get and dump CSEB entitlement', function (done) {
            // get the entitlements of a utility for a date and a revision number
            WBESUtils.getUtilEntitlement("20e8bfaf-8fb4-47c7-8522-5c208e3e270a", date_str, "10", false, function (err, entitlementsArray) {
                if (err) {
                    console.log(err);
                    return done(err)
                }
                // console.log(entitlementsArray);
                var fs = require('fs');
                fs.writeFile("dumps/ent_test.csv", entitlementsArray.join('\n'), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The ent_test.csv was saved!");
                    done();
                });
            });
        });
    });

    describe('get buyer requisitions', function () {
        it('it should get and dump CSEB requisitions', function (done) {
            //  get the ISGS Requisitions of a state
            WBESUtils.getUtilISGSReq("20e8bfaf-8fb4-47c7-8522-5c208e3e270a", date_str, "10", false, function (err, isgsReqArray) {
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
                    console.log("The file req_test.csv was saved!");
                    done();
                });
            });
        });
    });

    describe('get all surrenders of a buyer', function () {
        it('it should get and dump CSEB surrenders', function (done) {
            //  get the ISGS surrenders of a state
            WBESUtils.getUtilISGSSurrenders("20e8bfaf-8fb4-47c7-8522-5c208e3e270a", date_str, "10", null, null, null, false, function (err, isgsSurrObj) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsSurrObj);
                var fs = require('fs');
                fs.writeFile("dumps/surr_test.txt", JSON.stringify(isgsSurrObj), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file surr_test.txt was saved!");
                    done();
                });
            });
        });
    });

    describe('get seller entitlements', function () {
        it('it should get and dump VSTPS-V entitlement', function (done) {
            // get the entitlements of a utility for a date and a revision number
            WBESUtils.getUtilEntitlement("5df201ba-1574-475a-ad25-b26533170943", date_str, "10", true, function (err, entitlementsArray) {
                if (err) {
                    console.log(err);
                    return done(err)
                }
                // console.log(entitlementsArray);
                var fs = require('fs');
                fs.writeFile("dumps/seller_ent_test.csv", entitlementsArray.join('\n'), function (err) {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    console.log("The seller_ent_test.csv was saved!");
                    done();
                });
            });
        });
    });

    describe('get seller requisitions', function () {
        it('it should get and dump VSTPS-V requisitions', function (done) {
            //  get the ISGS Requisitions of a state
            WBESUtils.getUtilISGSReq("5df201ba-1574-475a-ad25-b26533170943", date_str, "10", true, function (err, isgsReqArray) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsReqArray);
                var fs = require('fs');
                fs.writeFile("dumps/seller_req_test.csv", isgsReqArray.join('\n'), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file seller_req_test.csv was saved!");
                    done();
                });
            });
        });
    });

    describe('get all surrenders of a seller', function () {
        it('it should get and dump VSTPS-V surrenders', function (done) {
            //  get the ISGS surrenders of a state
            WBESUtils.getUtilISGSSurrenders("5df201ba-1574-475a-ad25-b26533170943", date_str, "10", null, null, null, true, function (err, isgsSurrObj) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsSurrObj);
                var fs = require('fs');
                fs.writeFile("dumps/seller_surr_test.txt", JSON.stringify(isgsSurrObj), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file seller_surr_test.txt was saved!");
                    done();
                });
            });
        });
    });
});