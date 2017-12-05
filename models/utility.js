/**
 * Created by Nagasudhir on 12/5/2017.
 */

var WBESUtils = require('../utils/wbesUtils');

module.exports.getUtilities = function (forEnt, callback) {
    WBESUtils.getUtilities(forEnt, function (err, utilsObj) {
        if (err) {
            return callback(err);
        }
        callback(null, utilsObj);
    });
};