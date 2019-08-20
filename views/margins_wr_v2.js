/**
 * Created by Nagasudhir on 12/5/2017.
 */

var isCheckBoxesListCreated = false;
var initialDesiredGenerators = [];
var hideNegativeMargins = true;
var global_g = { 'dcSchObj': {}, 'plot_title': 'Margins Plot' };

window.onload = doOnLoadStuff();

function updateTimerBtnCallback() {
    updateTimerPeriodFromUI("marginFetchPeriodInput");
    restartTimer(timerFunc);
    getMargins();
}

function updateNonNegativeHideState() {
    var hideNegativeCheckbox = document.getElementById("hideNegativeCheckbox");
    if (hideNegativeCheckbox) {
        hideNegativeMargins = hideNegativeCheckbox.checked;
    }
}

function updateDateString() {
    var updateDateCheckbox = document.getElementById("updateDateCheckbox");
    if (updateDateCheckbox == null || updateDateCheckbox.checked != true) {
        // auto date update feature is disabled
        return;
    }
    // check date and change to today
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var todayStr = dd + '-' + mm + '-' + yyyy;
    if (document.getElementById('date_input').value != todayStr) {
        document.getElementById('date_input').value = todayStr;
    }
}

function doOnLoadStuff() {
    document.getElementById('date_input').value = dateStr_;
    updateRevsList(revs_);
    updateNonNegativeHideState();
    //getMargins();
    updateTimerBtnCallback();
}

function timerFunc() {
    // timer execution
    updateDateString();
    updateNonNegativeHideState();
    async.waterfall([
        function (callback) {
            // update the revisions
            refreshRevisionsCb(function (err, revListArray) {
                if (!err) {
                    document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': Revisions fetched!';
                    callback(null, true);
                } else {
                    document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': Revisions not fetched...';
                    callback(err);
                }
            });
        }
    ], function (err, res) {
        // handle err if required
        // do margin fetching
        getMargins();
    });
}

function getMargins() {
    var revSelEl = document.getElementById("revisions");
    var rev = revSelEl.options[revSelEl.selectedIndex].value;
    var date_str = document.getElementById('date_input').value;
    var queryStrs = [];
    queryStrs.push("util_id=ALL");
    queryStrs.push("rev=" + rev);
    queryStrs.push("date_str=" + date_str);

    document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching margins data...';

    $.ajax({
        //fetch categories from sever
        url: "./api/margins" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (dcSchObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching margins done!';
            //console.log("DC Object fetched is " + JSON.stringify(dcMatrixObj));
            // check if dcMatrixObj is correct
            if (dcSchObj == undefined || dcSchObj == null || dcSchObj['gen_names'] == undefined) {
                document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching margins done, but response not as desired...';
                return;
            }

            var resMatrix = [];
            if (dcSchObj['gen_names'].length > 0) {
                var displayStartBlk = 1;
                var displayEndBlk = 96;

                // create header with utilNames
                var row = [''];
                var row2 = ['TB'];
                for (var i = 0; i < dcSchObj["gen_names"].length; i++) {
                    var genName = dcSchObj["gen_names"][i];
                    row = row.concat([genName, "", "", ""]);
                    row2 = row2.concat(['DC', 'OnBar', 'Sch', 'Margin']);
                }
                resMatrix.push(row);
                resMatrix.push(row2);

                for (var i = 0; i < dcSchObj["time_blocks"].length; i++) {
                    var blk = +dcSchObj["time_blocks"][i];
                    if (blk < displayStartBlk || blk > displayEndBlk) {
                        continue;
                    }
                    var genNames = dcSchObj["gen_names"];
                    row = [blk];
                    for (var k = 0; k < genNames.length; k++) {
                        var totalDCVal = (+dcSchObj[genNames[k]]['total_dc'][blk - 1]).toFixed(0);
                        var onBarDCVal = (+dcSchObj[genNames[k]]['on_bar_dc'][blk - 1]).toFixed(0);
                        var schVal = (+dcSchObj[genNames[k]]['total'][blk - 1]).toFixed(0);
                        var marginVal = (+dcSchObj[genNames[k]]['margin'][blk - 1]).toFixed(0);
                        row = row.concat([totalDCVal, onBarDCVal, schVal, marginVal]);
                    }
                    resMatrix.push(row);
                }
                //console.log(resMatrix);
                createTable(resMatrix, document.getElementById('dcTable'));
                document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': margins fetching and table update done!';
                global_g['dcSchObj'] = dcSchObj;
            }
            // Now create the checkbox list
            if (isCheckBoxesListCreated == false) {
                var genSelectionDiv = document.getElementById('genSelectionDiv');
                genSelectionDiv.innerHTML = '';
                for (var k = 0; k < dcSchObj["gen_names"].length; k++) {
                    var genName = dcSchObj["gen_names"][k];
                    //check if the genName is a desired one
                    var checkedString = '';
                    if (initialDesiredGenerators.indexOf(genName) > -1) {
                        checkedString = ' checked';
                    }
                    genSelectionDiv.innerHTML += '<label style="margin-right:20px"><input type="checkbox" class="gen_select" onclick="updatePlot()"' + checkedString + ' value="' + genName + '"> ' + genName + '</label>';
                }
                isCheckBoxesListCreated = true;
            }
            global_g['plot_title'] = 'Margins for date ' + date_str + ' and Revision ' + rev;
            updatePlot();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': error in fetching margins...';
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
    updatePlot();
}

function deselectAllGen() {
    var genSelectionElements = document.getElementsByClassName("gen_select");
    for (var i = 0; i < genSelectionElements.length; i++) {
        genSelectionElements[i].checked = false;
    }
    updatePlot();
}

function updatePlot() {
    var dcSchObj = global_g['dcSchObj'];
    // find the required generators from checkboxes
    var genSelectionElements = document.getElementsByClassName("gen_select");
    activeGenerators = [];
    for (var i = 0; i < genSelectionElements.length; i++) {
        var isCheckedStatus = genSelectionElements[i].checked;
        if (typeof isCheckedStatus != "undefined" && isCheckedStatus == true) {
            activeGenerators.push(genSelectionElements[i].value);
        }
    }
    // Plot the margin values
    var dcPlotsDiv = document.getElementById("dcPlotsDiv");
    dcPlotsDiv.innerHTML = '';

    var xLabels = dcSchObj["time_blocks"].map(Number);
    var traces = [];
    var lineStyle = document.getElementById('line_style').value;
    var div = document.createElement('div');
    div.className = 'sch_plot_div';
    div.id = 'plotDiv_0';
    div.style.border = '1px gray dashed';
    dcPlotsDiv.appendChild(div);
    for (var k = 0; k < dcSchObj["gen_names"].length; k++) {
        // dynamically create divs - https://stackoverflow.com/questions/14094697/javascript-how-to-create-new-div-dynamically-change-it-move-it-modify-it-in
        genName = dcSchObj["gen_names"][k];
        if (activeGenerators.length != 0 && activeGenerators.indexOf(genName) == -1) {
            continue;
        }
        traces.push({
            x: xLabels,
            y: (dcSchObj[genName]['margin']).map(Number),
            fill: 'tonexty',
            name: genName,
            line: { shape: lineStyle }
        });
    }
    traces[0].fill = 'tozeroy';
    var layout = {
        title: global_g['plot_title'],
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

    document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching, table, plot update done!';
}