/**
 * Created by Nagasudhir on 11/21/2017.
 */

module.exports.parse = function (str) {
    var args = [].slice.call(arguments, 1),
        i = 0;

    return str.replace(/%s/g, function () {
        return args[i++];
    });
};

module.exports.parseCookieString = function parseCookies(rc) {
    var list = {};

    rc && rc.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
};

module.exports.makeTwoDigits = function (x) {
    if (x < 10) {
        return "0" + x;
    }
    else {
        return x;
    }
};