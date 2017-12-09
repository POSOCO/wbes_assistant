/**
 * Created by Nagasudhir on 12/10/2017.
 */

var chai = require('chai');
var should = chai.should();
var WBESUtils = require("../utils/wbesUtils");

var date_str = "21-11-2017";

describe('WBES DC', function () {
    beforeEach(function (done) {
        // do nothing
        done();
    });


    describe('get DC of ISGS', function () {
        it('it should get and dump VSTPS-V DC', function (done) {
            //  get the VSTPS-V DC
            WBESUtils.getISGSDeclarations(date_str, "10", "5df201ba-1574-475a-ad25-b26533170943", function (err, isgsDCArray) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                // console.log(isgsDCArray);
                var fs = require('fs');
                fs.writeFile("dumps/isgs_dc_test.csv", isgsDCArray.join('\n'), function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file isgs_dc_test.csv was saved!");
                    done();
                });
            });
        });
    });
});