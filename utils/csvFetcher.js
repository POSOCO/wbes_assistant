/**
 * Created by Nagasudhir on 11/21/2017.
 */
/**
 * Created by Nagasudhir on 11/21/2017.
 */

// http://samwize.com/2013/08/31/simple-http-get-slash-post-request-in-node-dot-js/
// https://stackoverflow.com/questions/17121846/node-js-how-to-send-headers-with-form-data-using-request-module

var request = require('request');
module.exports.doGetRequest = function (options, callback) {
    // Start the request
    request(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            // console.log(body);
            return callback(null, body, res);
        } else if (err) {
            return callback(err);
        } else {
            return callback({statusCode: res.statusCode});
        }
    });
};