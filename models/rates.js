var readFile = require('fs').readFile;
var writeFile = require('fs').writeFile;

module.exports.getVariableCosts = function (callback) {
    var obj;
    readFile(__dirname + '/rates.json', 'utf8', function (err, data) {
        if (err) { return callback(err); }
        obj = JSON.parse(data);
        callback(null, { 'rates': obj });
    });
}

module.exports.setVariableCosts = function (ratesObj, callback) {
    var ratesObj;
    readFile(__dirname + '/rates.json', 'utf8', function (err, data) {
        if (err) { return callback(err); }
        ratesObj = JSON.parse(data);
        for (var gen in rates) {
            if (rates.hasOwnProperty(gen)) {
                ratesObj[gen] = rates[gen];
            }
        }
        var jsonContent = JSON.stringify(ratesObj);
        writeFile(__dirname + '/rates.json', jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                return callback(err);
            }

            console.log("JSON file has been saved.");
        });
    });
}