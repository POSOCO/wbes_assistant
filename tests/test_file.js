/**
 * Created by Nagasudhir on 11/21/2017.
 */

var WBESUtils = require("../utils/wbesUtils");

var date_str = "21-11-2017";

/*
 var fs = require('fs');
 fs.writeFile("test1.txt", options.url, function(err) {
 if(err) {
 return console.log(err);
 }
 console.log("The file was saved!");
 process.exit();
 });
 */
/*
 // get the revision Number for Date
 WBESUtils.getRevisionsForDate(date_str, function (err, revisionsArray) {
 if (err) {
 return console.log(err);
 }
 console.log("The revision numbers are " + revisionsArray);
 });
 */
/*
 // get the utilities
 WBESUtils.getUtilities(false, function (err, utilsObj) {
 if (err) {
 return console.log(err);
 }
 console.log("The buyers are ");
 var utilsStr = [];
 for (var i = 0; i < utilsObj["sellers"].length; i++) {
 utilsStr.push(utilsObj["sellers"][i]["Acronym"]);
 }
 console.log(utilsStr.join(","));
 //console.log(Object.keys(utilsObj["buyers"][0]));
 });
 */
/*
 // get the entitlements of a utility for a date and a revision number
 WBESUtils.getBuyerEntitlement("20e8bfaf-8fb4-47c7-8522-5c208e3e270a", date_str, "10", function (err, entitlementsArray) {
 if (err) {
 return console.log(err);
 }
 console.log(entitlementsArray);
 var fs = require('fs');
 fs.writeFile("test.txt", entitlementsArray.join('\n'), function (err) {
 if (err) {
 return console.log(err);
 }
 console.log("The file was saved!");
 });
 });
 */

/*
 //  get the ISGS Net schedules of a state
 WBESUtils.getBuyerISGSNetSchedules("c88b0ddb-e90c-4a89-8855-ac6512897c72", date_str, "10", function (err, isgsNetSchedulesArray) {
 if (err) {
 return console.log(err);
 }
 console.log(isgsNetSchedulesArray);
 var fs = require('fs');
 fs.writeFile("test.txt", isgsNetSchedulesArray.join('\n'), function (err) {
 if (err) {
 return console.log(err);
 }
 console.log("The file was saved!");
 });
 });
 */

/*
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
 console.log("The file was saved!");
 });
 });
 */