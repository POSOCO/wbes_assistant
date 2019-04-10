/**
 * Created by Nagasudhir on 12/10/2017.
 */

var chai = require('chai');
var should = chai.should();
var RatesModel = require("../models/rates");

describe('WBES rates', function () {
    beforeEach(function (done) {
        // do nothing
        done();
    });

    describe('get rates of ISGS', function () {
        it('it should get ISGS rates', function (done) {
            //  get the variable costs
            RatesModel.getVariableCosts(function (err, ratesObj) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                console.log("rates json object was read successfully...");
                //console.log(ratesObj);
                done();
            });
        });

        it('it should set ISGS rates', function (done) {
            //  set the variable costs
            ratesObj = { "KSTPS_I&II": 15 };
            RatesModel.setVariableCosts(ratesObj, function (err, ratesObj) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                console.log("rates json object was saved successfully...");
                //console.log(ratesObj);
                done();
            });
        });
    });
});