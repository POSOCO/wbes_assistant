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
    describe('get entitlements', function () {
        it('it should get and dump CSEB entitlement', function (done) {
            //  get the ISGS Requisitions of a state
            WBESUtils.getBuyerISGSReq("20e8bfaf-8fb4-47c7-8522-5c208e3e270a", date_str, "10", function (err, isgsReqArray) {
                if (err) {
                    return console.log(err);
                }
                console.log(isgsReqArray);
                var fs = require('fs');
                fs.writeFile("test.txt", isgsReqArray.join('\n'), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file test.txt was saved!");
                    done();
                });
            });
        });
    });
});