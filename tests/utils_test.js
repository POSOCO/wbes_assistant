var ArrayHelper = require("../helpers/arrayHelpers");
var WBESUtils = require("../utils/wbesUtils");
var chai = require('chai');
var expect = chai.expect;

describe('General Utils', function () {
    beforeEach(function (done) {
        // do nothing
        done();
    });
    describe('check general utils', function () {
        it('it should check array utils functions', function () {
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

            expect(ArrayHelper.getUniqueList(null)).to.eql([]);
            expect(ArrayHelper.getUniqueList([])).to.eql([]);
            expect(ArrayHelper.getUniqueList([1])).to.eql([1]);
            expect(ArrayHelper.getUniqueList([2, 2])).to.eql([2]);
            expect(ArrayHelper.getUniqueList([1, 1, 2])).to.eql([1, 2]);
            expect(ArrayHelper.getUniqueList([4, 1, 3, 1, 4])).to.eql([4, 1, 3]);

            expect(ArrayHelper.getAllIndexesOfVal(null)).to.eql([]);
            expect(ArrayHelper.getAllIndexesOfVal(null, null)).to.eql([]);
            expect(ArrayHelper.getAllIndexesOfVal([], null)).to.eql([]);
            expect(ArrayHelper.getAllIndexesOfVal([2], null)).to.eql([]);
            expect(ArrayHelper.getAllIndexesOfVal([1, 2, 3], null)).to.eql([]);
            expect(ArrayHelper.getAllIndexesOfVal([1, 2, 1, 3, 1], 1)).to.eql([0, 2, 4]);
            expect(ArrayHelper.getAllIndexesOfVal([1, 2, 1, 3, 1, 3], 3)).to.eql([3, 5]);
            expect(ArrayHelper.getAllIndexesOfVal(['a', 'as', 'f', ' as', 'fd', 'as ', '  as '], 'as', true)).to.eql([1, 3, 5, 6]);

        });
    });

    describe('check WBES utils generic functions', function () {
        it('it should check WBES generic utils function', function () {
            expect(2).to.eql(2);
            expect(WBESUtils.getStartEndBlks()).to.eql({startBlk: 1, endBlk: 96});
            expect(WBESUtils.getStartEndBlks(null)).to.eql({startBlk: 1, endBlk: 96});
            expect(WBESUtils.getStartEndBlks(null, null)).to.eql({startBlk: 1, endBlk: 96});
            expect(WBESUtils.getStartEndBlks(1, 96)).to.eql({startBlk: 1, endBlk: 96});
            expect(WBESUtils.getStartEndBlks(15, 10)).to.eql({startBlk: 1, endBlk: 96});
            expect(WBESUtils.getStartEndBlks(29, 35)).to.eql({startBlk: 29, endBlk: 35});
        });
    });

});