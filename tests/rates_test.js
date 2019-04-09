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
            //  get the VSTPS-V DC matrix
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
    });
});