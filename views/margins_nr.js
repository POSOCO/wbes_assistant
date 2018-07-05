/**
 * Created by Nagasudhir on 12/5/2017.
 */
window.onload = doOnLoadStuff();

var isCheckBoxesListCreated = false;
var initialDesiredGenerators = ['ANTA', 'AURY', 'CHAMERA2', 'CHAMERA3', 'DADRI', 'DADRT2', 'DHAULIGNGA', 'DULHASTI', 'JHAJJAR', 'KISHANGANGA', 'KOLDAM', 'KOTESHWR', 'NAPP', 'NJPC', 'PARBATI3', 'RAMPUR', 'RAPPC', 'RIHAND1', 'RIHAND2', 'RIHAND3', 'SEWA2', 'SINGRAULI', 'SINGRAULI_HYDRO', 'TEHRI', 'UNCHAHAR1', 'UNCHAHAR2', 'UNCHAHAR3', 'UNCHAHAR4', 'URI2'];
var hideNegativeMargins = true;
var marginReloadTimerId = null;
var marginReloadMills = 300000; // 5 mins

function stopMarginTimer(){
    clearInterval(marginReloadTimerId);
}

function updateMarginTimerPeriod(periodMilli){
    marginReloadMills = periodMilli;
}

function configMarginTimer(){
    stopMarginTimer();
    marginReloadTimerId = setInterval(getMargins, marginReloadMills);
    getMargins();
}

function updateMarginTimerPeriodFromUI(){
    var marginFetchPeriodInput = document.getElementById("marginFetchPeriodInput");
    if(marginFetchPeriodInput){
        var marginFetchPeriodMins = marginFetchPeriodInput.value;
        updateMarginTimerPeriod(marginFetchPeriodMins*60*1000);
    }
}

function updateTimerCallback(){
    updateMarginTimerPeriodFromUI();
    configMarginTimer();
}

function updateNonNegativeHideState(){
    var hideNegativeCheckbox = document.getElementById("hideNegativeCheckbox");
    if(hideNegativeCheckbox){
        hideNegativeMargins = hideNegativeCheckbox.checked;
    }
}

function doOnLoadStuff() {
    document.getElementById('date_input').value = dateStr_;
    updateRevsList(revs_);
    //getMargins();
    updateTimerCallback();
}

function getMargins() {
    updateNonNegativeHideState();
    var revSelEl = document.getElementById("revisions");
    var rev = revSelEl.options[revSelEl.selectedIndex].value;
    var date_str = document.getElementById('date_input').value;
    var queryStrs = [];
    queryStrs.push("util_id=ALL");
    queryStrs.push("rev=" + rev);
    queryStrs.push("date_str=" + date_str);
    document.getElementById('fetchStatusLabel').innerHTML = 'fetching DC data...';
    $.ajax({
        //fetch categories from sever
        url: "./api/dc_nr" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (dcMatrixObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = 'fetching dc done!';
            //console.log("DC Object fetched is " + JSON.stringify(dcMatrixObj));
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
                    row = row.concat([dcMatrixObj["gen_names"][i]]);
                    row2 = row2.concat(['OnBar']);
                }
                resMatrix.push(row);
                resMatrix.push(row2);

                for (var i = 0; i < dcMatrixObj["time_blocks"].length; i++) {
                    var blk = +dcMatrixObj["time_blocks"][i];
                    if (blk < displayStartBlk || blk > displayEndBlk) {
                        continue;
                    }
                    var genNames = dcMatrixObj["gen_names"];
                    row = [blk];
                    for (var k = 0; k < genNames.length; k++) {
                        var onBarDCVal = (+dcMatrixObj[genNames[k]]['on_bar_dc'][blk - 1]).toFixed(0);
                        //var offBarDCVal = (+dcMatrixObj[genNames[k]]['off_bar_dc'][blk - 1]).toFixed(0);
                        //var totDCVal = (+dcMatrixObj[genNames[k]]['total_dc'][blk - 1]).toFixed(0);
                        row = row.concat([onBarDCVal]);
                    }
                    resMatrix.push(row);
                }
                //console.log(resMatrix);
                createTable(resMatrix, document.getElementById('dcTable'));
                document.getElementById('fetchStatusLabel').innerHTML = 'dc fetching and table update done!';

                /*
                var dcPlotsDiv = document.getElementById("dcPlotsDiv");
                dcPlotsDiv.innerHTML = '';
                */

                var xLabels = dcMatrixObj["time_blocks"].map(Number);
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching DC values done!';
                fetchNetSchAfterDC(dcMatrixObj);
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
    var date_str = document.getElementById('date_input').value;
    var queryStrs = [];
    queryStrs.push("util_id=ALL");
    queryStrs.push("rev=" + rev);
    queryStrs.push("date_str=" + date_str);
    queryStrs.push("is_seller=true");
    document.getElementById('fetchStatusLabel').innerHTML = 'fetching Net Sch data...';
    $.ajax({
        //fetch categories from sever
        url: "./api/net_sch_nr" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (netSchMatrixObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = 'fetching net schedules done!';
            //console.log("Net Sch Object fetched is " + JSON.stringify(netSchMatrixObj));
            // check if netSchMatrixObj is correct
            if (netSchMatrixObj == undefined || netSchMatrixObj == null || netSchMatrixObj['gen_names'] == undefined) {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching net schedules done, but response not as desired...';
                return;
            }

            var resMatrix = [];

            if (netSchMatrixObj['gen_names'].length > 0) {
                // copy the dcMatrixObj for adding schedules also
                var dcSchMatrixObj = dcMatrixObj;
                // initialise the net schedule attributes of the dcSchMatrixObj to 0
                var zeroValues = function () {
                    var zeroValuesArray = [];
                    for (var i = 0; i < 96; i++) {
                        zeroValuesArray.push(0);
                    }
                    return zeroValuesArray;
                };

                for (var i = 0; i < dcSchMatrixObj["gen_names"].length; i++) {
                    dcSchMatrixObj[dcSchMatrixObj["gen_names"][i]]['total'] = zeroValues();
                    dcSchMatrixObj[dcSchMatrixObj["gen_names"][i]]['margin'] = zeroValues();
                }

                var genNames = netSchMatrixObj["gen_names"];
                var dcGenNames = [];

                for (var i = 0; i < genNames.length; i++) {
                    //var dcUtilAcronym = acronymFromNetSchAcronym(genNames[i]);
                    var dcUtilAcronym = genNames[i];
                    dcGenNames.push(dcUtilAcronym);
                }

                for (var i = 0; i < genNames.length; i++) {
                    // genNames is net sch acronym and dcGenNames is dc acronym
                    if (dcSchMatrixObj[dcGenNames[i]] != undefined) {
                        dcSchMatrixObj[dcGenNames[i]]['total'] = netSchMatrixObj[genNames[i]]['total'];
                        for (var k = 0; k < 96; k++) {
                            var marginTemp = (+dcSchMatrixObj[dcGenNames[i]]['on_bar_dc'][k]) - (+dcSchMatrixObj[dcGenNames[i]]['total'][k]);
                            if((hideNegativeMargins != false) && (marginTemp < 0)){
                                marginTemp = 0
                            }
                            dcSchMatrixObj[dcGenNames[i]]['margin'][k] = marginTemp;
                        }
                    } else {
                        // todo handle separately if dc gen name of a corresponding net sch gen name is not found
                    }
                }
                var displayStartBlk = Number(document.getElementById('from_blk').value);
                var displayEndBlk = Number(document.getElementById('to_blk').value);

                // create header with utilNames
                var row = [''];
                var row2 = ['TB'];

                for (var i = 0; i < dcSchMatrixObj["gen_names"].length; i++) {
                    var genName = dcSchMatrixObj["gen_names"][i];
                    row = row.concat([genName, genName, genName]);
                    row2 = row2.concat(['OnBar', 'Net Schedule', 'Margin']);
                }
                resMatrix.push(row);
                resMatrix.push(row2);

                for (var i = 0; i < dcSchMatrixObj["time_blocks"].length; i++) {
                    var blk = +dcSchMatrixObj["time_blocks"][i];
                    if (blk < displayStartBlk || blk > displayEndBlk) {
                        continue;
                    }
                    row = [blk];
                    for (var k = 0; k < dcSchMatrixObj["gen_names"].length; k++) {
                        var genName = dcSchMatrixObj["gen_names"][k];
                        var onBarDCVal = (+dcSchMatrixObj[genName]['on_bar_dc'][blk - 1]).toFixed(0);
                        var totalVal = (+dcSchMatrixObj[genName]['total'][blk - 1]).toFixed(0);
                        var marginVal = (+dcSchMatrixObj[genName]['margin'][blk - 1]).toFixed(0);
                        row = row.concat([onBarDCVal, totalVal, marginVal]);
                    }
                    resMatrix.push(row);
                }
                //console.log(resMatrix);
                createTable(resMatrix, document.getElementById('dcTable'));
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching and table update done!';

                // Now create the checkbox list
                if (isCheckBoxesListCreated == false) {
                    var genSelectionDiv = document.getElementById('genSelectionDiv');
                    genSelectionDiv.innerHTML = '';
                    for (var k = 0; k < dcSchMatrixObj["gen_names"].length; k++) {
                        var genName = dcSchMatrixObj["gen_names"][k];
                        //check if the genName is a desired one
                        var checkedString = '';
                        if (initialDesiredGenerators.indexOf(genName) > -1) {
                            checkedString = ' checked';
                        }
                        genSelectionDiv.innerHTML += '<label style="margin-right:20px"><input type="checkbox" class="gen_select" onclick="getMargins()"' + checkedString + ' value="' + genName + '"> ' + genName + '</label>';
                    }
                    isCheckBoxesListCreated = true;
                }

                // find the required generators from checkboxes
                var genSelectionElements = document.getElementsByClassName("gen_select");
                activeGenerators = [];
                for (var i = 0; i < genSelectionElements.length; i++) {
                    var isCheckedStatus = genSelectionElements[i].checked;
                    if (typeof isCheckedStatus != "undefined" && isCheckedStatus == true) {
                        activeGenerators.push(genSelectionElements[i].value);
                    }
                }

                var dcPlotsDiv = document.getElementById("dcPlotsDiv");
                dcPlotsDiv.innerHTML = '';

                var xLabels = dcSchMatrixObj["time_blocks"].map(Number);
                var traces = [];
                var div = document.createElement('div');
                div.className = 'sch_plot_div';
                div.id = 'plotDiv_0';
                div.style.border = '1px gray dashed';
                dcPlotsDiv.appendChild(div);
                for (var k = 0; k < dcSchMatrixObj["gen_names"].length; k++) {
                    // dynamically create divs - https://stackoverflow.com/questions/14094697/javascript-how-to-create-new-div-dynamically-change-it-move-it-modify-it-in
                    genName = dcSchMatrixObj["gen_names"][k];
                    if (activeGenerators.length != 0 && activeGenerators.indexOf(genName) == -1) {
                        continue;
                    }
                    traces.push({
                        x: xLabels,
                        y: (dcSchMatrixObj[genName]['margin']).map(Number),
                        fill: 'tonexty',
                        name: genName
                    });
                }
                traces[0].fill = 'tozeroy';
                var layout = {
                    title: 'Margins for date ' + date_str + ' and Revision ' + rev,
                    xaxis: {
                        title: 'Block Number',
                        dtick: 4
                    },
                    yaxis: {
                        title: 'Margin'
                    },
                    legend: {
                        font: {
                            "size": "10"
                        },
                        orientation: "h"
                    },
                    margin: { 't': 35 },
                    height: 800
                };
                Plotly.newPlot(div, stackedArea(traces), layout);
                div
                    .on('plotly_hover', function (data) {
                        if (data.points.length > 0) {
                            var pointIndex = data.points[0]['pointNumber'];
                            var textDataArray = document.getElementById("plotDiv_0").data;
                            var infoStrings = [];
                            for (var i = textDataArray.length - 1; i >= 0; i--) {
                                infoStrings.push(textDataArray[i]['text'][pointIndex]);
                            }
                            document.getElementById("reserveInfoDiv").innerHTML = "BLOCK (" + data.points[0]['x'] + ')<div style="height: 5px"></div>' + infoStrings.join('<div style="height: 5px"></div>');
                        }
                    })
                    .on('plotly_unhover', function (data) {
                        //document.getElementById("reserveInfoDiv").innerHTML = '';
                    });
                function stackedArea(traces) {
                    var i, j;
                    for (i = 0; i < traces.length; i++) {
                        traces[i].text = [];
                        traces[i].hoverinfo = 'text';
                        for (j = 0; j < (traces[i]['y'].length); j++) {
                            traces[i].text.push(traces[i]['name'] + " (" + traces[i]['y'][j].toFixed(0) + ")");
                        }
                    }
                    for (i = 1; i < traces.length; i++) {
                        for (j = 0; j < (Math.min(traces[i]['y'].length, traces[i - 1]['y'].length)); j++) {
                            traces[i]['y'][j] += traces[i - 1]['y'][j];
                        }
                    }
                    return traces;
                }

                // todo enable only net sch of plot in the net sch columns
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching, table, plot update done!';
            } else {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching done, net schedules values not found...';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById('fetchStatusLabel').innerHTML = 'error in fetching net schedules...';
            console.log(textStatus, errorThrown);
            // toastr.error("The error from server for surrenders fetch is --- " + jqXHR.responseJSON.message);
        }
    });
}

function selectAllGen() {
    var genSelectionElements = document.getElementsByClassName("gen_select");
    for (var i = 0; i < genSelectionElements.length; i++) {
        genSelectionElements[i].checked = true;
    }
    getMargins();
}

function deselectAllGen() {
    var genSelectionElements = document.getElementsByClassName("gen_select");
    for (var i = 0; i < genSelectionElements.length; i++) {
        genSelectionElements[i].checked = false;
    }
    getMargins();
}