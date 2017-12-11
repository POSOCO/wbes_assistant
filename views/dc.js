/**
 * Created by Nagasudhir on 12/5/2017.
 */
window.onload = doOnLoadStuff();

function doOnLoadStuff() {
    document.getElementById('date_input').value = dateStr_;
    updateRevsList(revs_);
    var utilSelEl = document.getElementById("utils");
    for (var i = 0; i < utilsObj_['sellers'].length; i++) {
        var option = document.createElement("option");
        option.text = utilsObj_['sellers'][i]['Acronym'];
        option.value = utilsObj_['sellers'][i]['UtilId'];
        option.setAttribute('data-is_seller', 'true');
        utilSelEl.add(option);
    }
    option = document.createElement("option");
    option.text = 'ALL';
    option.value = 'ALL';
    option.setAttribute('data-is_seller', 'true');
    utilSelEl.add(option);
}

function acronymFromNetSchAcronym(acr) {
    var searchArray = utilsObj_['sellers'];
    var sourceArray = utilsNetSchObj_['sellers'];
    var searchUtilId = null;
    // find the entry in source array for util Id
    for (var i = 0; i < sourceArray.length; i++) {
        if (sourceArray[i]['Acronym'] == acr) {
            searchUtilId = sourceArray[i]['UtilId'];
            break;
        }
    }
    if (searchUtilId == null) {
        return null;
    }
    for (var i = 0; i < searchArray.length; i++) {
        if (searchArray[i]['UtilId'] == searchUtilId) {
            return searchArray[i]['Acronym'];
            break;
        }
    }
    return null;
}

function getDC() {
    var revSelEl = document.getElementById("revisions");
    var rev = revSelEl.options[revSelEl.selectedIndex].value;
    var utilSelEl = document.getElementById("utils");
    var utilId = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('value');
    var date_str = document.getElementById('date_input').value;
    var queryStrs = [];
    queryStrs.push("util_id=" + utilId);
    queryStrs.push("rev=" + rev);
    queryStrs.push("date_str=" + date_str);
    document.getElementById('fetchStatusLabel').innerHTML = 'fetching DC data...';
    $.ajax({
        //fetch categories from sever
        url: "./api/dc" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (dcMatrixObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = 'fetching dc done!';
            console.log("DC Object fetched is " + JSON.stringify(dcMatrixObj));
            // check if dcMatrixObj is correct
            if (dcMatrixObj == undefined || dcMatrixObj == null || dcMatrixObj['gen_names'] == undefined) {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching dc done, but response not as desired...';
                return;
            }

            var resMatrix = [];
            if (dcMatrixObj['gen_names'].length > 0) {
                var displayStartBlk = Number(document.getElementById('from_blk').value);
                var displayEndBlk = Number(document.getElementById('to_blk').value);

                // create header with utilNames
                var row = [''];
                var row2 = ['TB'];
                for (var i = 0; i < dcMatrixObj["gen_names"].length; i++) {
                    row = row.concat([dcMatrixObj["gen_names"][i], dcMatrixObj["gen_names"][i], dcMatrixObj["gen_names"][i]]);
                    row2 = row2.concat(['OnBar', 'OffBar', 'Total']);
                }
                resMatrix.push(row);
                resMatrix.push(row2);

                for (var i = 0; i < dcMatrixObj["time_blocks"].length; i++) {
                    var blk = +dcMatrixObj["time_blocks"][i];
                    if (blk < displayStartBlk || blk > displayEndBlk) {
                        continue;
                    }
                    var genNames = dcMatrixObj["gen_names"];
                    var row = [blk];
                    for (var k = 0; k < genNames.length; k++) {
                        var onBarDCVal = (+dcMatrixObj[genNames[k]]['on_bar_dc'][i]);
                        var offBarDCVal = (+dcMatrixObj[genNames[k]]['off_bar_dc'][i]).toFixed(0);
                        var totDCVal = (+dcMatrixObj[genNames[k]]['total_dc'][i]).toFixed(0);
                        row = row.concat([onBarDCVal, offBarDCVal, totDCVal]);
                    }
                    resMatrix.push(row);
                }
                console.log(resMatrix);
                createTable(resMatrix, document.getElementById('dcTable'));
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching and table update done!';

                var dcPlotsDiv = document.getElementById("dcPlotsDiv");
                var traces = [];
                var xLabels = dcMatrixObj["time_blocks"].map(Number);

                for (var k = 0; k < genNames.length; k++) {
                    traces.push({
                        x: xLabels,
                        y: (dcMatrixObj[genNames[k]]['on_bar_dc']).map(Number),
                        name: genNames[k] + " (OnBar)"
                    });
                    traces.push({
                        x: xLabels,
                        y: (dcMatrixObj[genNames[k]]['off_bar_dc']).map(Number),
                        name: genNames[k] + " (OffBar)"
                    });
                    traces.push({
                        x: xLabels,
                        y: (dcMatrixObj[genNames[k]]['total_dc']).map(Number),
                        name: genNames[k] + " (Total)"
                    });
                }
                var layout = {
                    title: 'DC Plot of for date ' + date_str + ' and Revision ' + rev,
                    xaxis: {
                        title: '',
                        dtick: 4
                    },
                    yaxis: {
                        title: 'DC Value'
                    },
                    legend: {
                        font: {
                            "size": "20"
                        },
                        orientation: "h"
                    },
                    margin: {'t': 35},
                    height: 500
                };
                if (utilId == 'ALL') {
                    layout['margin']['b'] = 400;
                    layout['legend']['font']['size'] = 12;
                    layout['height'] = 1000;
                }
                Plotly.newPlot(dcPlotsDiv, traces, layout);
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching, table, plot update done!';
                // fetchNetSchAfterDC(dcMatrixObj);
            } else {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching done, dc values not found...';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById('fetchStatusLabel').innerHTML = 'error in fetching dc...';
            console.log(textStatus, errorThrown);
            // toastr.error("The error from server for surrenders fetch is --- " + jqXHR.responseJSON.message);
        }
    });
}

function fetchNetSchAfterDC(dcMatrixObj) {
    var revSelEl = document.getElementById("revisions");
    var rev = revSelEl.options[revSelEl.selectedIndex].value;
    var utilSelEl = document.getElementById("utils");
    var utilId = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('value');
    var date_str = document.getElementById('date_input').value;
    var queryStrs = [];
    queryStrs.push("util_id=" + utilId);
    queryStrs.push("rev=" + rev);
    queryStrs.push("date_str=" + date_str);
    queryStrs.push("is_seller=true");
    document.getElementById('fetchStatusLabel').innerHTML = 'fetching Net Sch data...';
    $.ajax({
        //fetch categories from sever
        url: "./api/net_sch" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (netSchMatrixObj) {
            // todo add additional data to dcMatrixObj and display table with plots and enable only net sch of plot in the net sch columns
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = 'fetching net schedules done!';
            console.log("Net Sch Object fetched is " + JSON.stringify(netSchMatrixObj));
            // check if netSchMatrixObj is correct
            if (netSchMatrixObj == undefined || netSchMatrixObj == null || netSchMatrixObj['gen_names'] == undefined) {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching net scheduled done, but response not as desired...';
                return;
            }

            var resMatrix = [];


            if (netSchMatrixObj['gen_names'].length > 0) {
                var genNames = netSchMatrixObj["gen_names"];
                var dcGenNames = [];

                for (var i = 0; i < genNames.length; i++) {
                    var dcUtilAcronym = acronymFromNetSchAcronym(genNames[i]);
                    if (dcUtilAcronym == null) {
                        dcUtilAcronym = genNames[i];
                    }
                    dcGenNames.push(dcUtilAcronym);
                }

                // copy the dcMatrixObj for adding schedules also
                var dcSchMatrixObj = dcMatrixObj;
                for (var i = 0; i < genNames.length; i++) {
                    if (dcSchMatrixObj[dcGenNames[i]] != undefined) {
                        //stub
                    } else {
                        // todo convert net sch gen name to sc gen name and handle separately if dc gen name not found
                    }
                }
                var displayStartBlk = Number(document.getElementById('from_blk').value);
                var displayEndBlk = Number(document.getElementById('to_blk').value);

                // create header with utilNames
                var row = [''];
                var row2 = ['TB'];

                for (var i = 0; i < netSchMatrixObj["gen_names"].length; i++) {
                    row = row.concat([netSchMatrixObj["gen_names"][i], netSchMatrixObj["gen_names"][i], netSchMatrixObj["gen_names"][i]]);
                    row2 = row2.concat(['OnBar', 'OffBar', 'Total']);
                }
                resMatrix.push(row);
                resMatrix.push(row2);

                for (var i = 0; i < netSchMatrixObj["time_blocks"].length; i++) {
                    var blk = +netSchMatrixObj["time_blocks"][i];
                    if (blk < displayStartBlk || blk > displayEndBlk) {
                        continue;
                    }
                    var row = [blk];
                    for (var k = 0; k < genNames.length; k++) {
                        var onBarDCVal = (+netSchMatrixObj[genNames[k]]['on_bar_dc'][i]);
                        var offBarDCVal = (+netSchMatrixObj[genNames[k]]['off_bar_dc'][i]).toFixed(0);
                        var totDCVal = (+netSchMatrixObj[genNames[k]]['total_dc'][i]).toFixed(0);
                        row = row.concat([onBarDCVal, offBarDCVal, totDCVal]);
                    }
                    resMatrix.push(row);
                }
                console.log(resMatrix);
                createTable(resMatrix, document.getElementById('dcTable'));
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching and table update done!';

                var dcPlotsDiv = document.getElementById("dcPlotsDiv");
                var traces = [];
                var xLabels = netSchMatrixObj["time_blocks"].map(Number);

                for (var k = 0; k < genNames.length; k++) {
                    traces.push({
                        x: xLabels,
                        y: (netSchMatrixObj[genNames[k]]['on_bar_dc']).map(Number),
                        name: genNames[k] + " (OnBar)"
                    });
                    traces.push({
                        x: xLabels,
                        y: (netSchMatrixObj[genNames[k]]['off_bar_dc']).map(Number),
                        name: genNames[k] + " (OffBar)"
                    });
                    traces.push({
                        x: xLabels,
                        y: (netSchMatrixObj[genNames[k]]['total_dc']).map(Number),
                        name: genNames[k] + " (Total)"
                    });
                }
                var layout = {
                    title: 'DC Plot of for date ' + date_str + ' and Revision ' + rev,
                    xaxis: {
                        title: '',
                        dtick: 4
                    },
                    yaxis: {
                        title: 'DC Value'
                    },
                    legend: {
                        font: {
                            "size": "20"
                        },
                        orientation: "h"
                    },
                    margin: {'t': 35},
                    height: 500
                };
                if (utilId == 'ALL') {
                    layout['margin']['b'] = 400;
                    layout['legend']['font']['size'] = 12;
                    layout['height'] = 1000;
                }
                Plotly.newPlot(dcPlotsDiv, traces, layout);
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching, table, plot update done!';
                fetchNetSchAfterDC(netSchMatrixObj);
            } else {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching done, dc values not found...';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById('fetchStatusLabel').innerHTML = 'error in fetching net schedules...';
            console.log(textStatus, errorThrown);
            // toastr.error("The error from server for surrenders fetch is --- " + jqXHR.responseJSON.message);
        }
    });
}