var ArrayHelper = require("../helpers/arrayHelpers");
var chai = require('chai');
var expect = chai.expect;

describe('General Utils', function () {
    beforeEach(function (done) {
        // do nothing
        done();
    });
    describe('check general utils', function () {
        it('it should check array dimensions function', function () {
            expect(2).to.eql(2);
            expect(ArrayHelper.getDim(null)).to.eql([]);
            expect(ArrayHelper.getDim(123)).to.eql([]); // []
            expect(ArrayHelper.getDim([1])).to.eql([1]); // [1]
            expect(ArrayHelper.getDim([1, 2])).to.eql([2]); // [2]
            expect(ArrayHelper.getDim([1, [2]])).to.eql(false); // false
            expect(ArrayHelper.getDim([[1, 2], [3]])).to.eql(false); // false
            expect(ArrayHelper.getDim([[1, 2], [1, 2]])).to.eql([2, 2]); // [2, 2]
            expect(ArrayHelper.getDim([[1, 2], [1, 2], [1, 2]])).to.eql([3, 2]); // [3, 2]
            expect(ArrayHelper.getDim([[[1, 2, 3], [1, 2, 4]], [[2, 1, 3], [4, 4, 6]]])).to.eql([2, 2, 3]); // [2, 2, 3]
            expect(ArrayHelper.getDim([[[1, 2, 3], [1, 2, 4]], [[2, 1], [4, 4]]])).to.eql(false); // false
        });
    });
});