/**
 * Created by Nagasudhir on 12/5/2017.
 */

var isCheckBoxesListCreated = false;
var initialDesiredGenerators = [];
var hideNegativeRtm = false;
var global_g = { 'rtmObj': {}, 'plot_title': 'RTM Plot' };
const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
})

window.onload = doOnLoadStuff();

function updateTimerBtnCallback() {
    updateTimerPeriodFromUI("rtmFetchPeriodInput");
    restartTimer(timerFunc);
    getRtm();
}

function updateNonNegativeHideState() {
    var hideNegativeCheckbox = document.getElementById("hideNegativeCheckbox");
    if (hideNegativeCheckbox) {
        hideNegativeRtm = hideNegativeCheckbox.checked;
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
        // do RTM fetching
        getRtm();
    });
}

function getRtm() {
    var revSelEl = document.getElementById("revisions");
    var rev = revSelEl.options[revSelEl.selectedIndex].value;
    var date_str = document.getElementById('date_input').value;
    var queryStrs = [];
    queryStrs.push("util_id=ALL");
    queryStrs.push("is_seller=true");
    queryStrs.push("rev=" + rev);
    queryStrs.push("date_str=" + date_str);

    document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching rtm data...';

    $.ajax({
        //fetch categories from sever
        url: "./api/rtm" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (rtmObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching rtm done!';
            //console.log("DC Object fetched is " + JSON.stringify(dcMatrixObj));
            // check if dcMatrixObj is correct
            if (rtmObj == undefined || rtmObj == null || rtmObj['gen_names'] == undefined) {
                document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching rtm done, but response not as desired...';
                return;
            }

            var resMatrix = [];
            if (rtmObj['gen_names'].length > 0) {
                var displayStartBlk = 1;
                var displayEndBlk = 96;

                // create header with utilNames
                var row = [''];
                var row2 = ['TB'];
                for (var i = 0; i < rtmObj["gen_names"].length; i++) {
                    var genName = rtmObj["gen_names"][i];
                    row = row.concat([genName]);
                    row2 = row2.concat(['rtm']);
                }
                resMatrix.push(row);
                resMatrix.push(row2);

                for (var i = 0; i < rtmObj["time_blocks"].length; i++) {
                    var blk = +rtmObj["time_blocks"][i];
                    if (blk < displayStartBlk || blk > displayEndBlk) {
                        continue;
                    }
                    var genNames = rtmObj["gen_names"];
                    row = [blk];
                    for (var k = 0; k < genNames.length; k++) {
                        var rtmVal = (+rtmObj[genNames[k]]['rtm'][blk - 1]).toFixed(0);
                        row = row.concat([rtmVal]);
                    }
                    resMatrix.push(row);
                }
                //console.log(resMatrix);
                createTable(resMatrix, document.getElementById('dcTable'));
                document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': RTM fetching and table update done!';
                global_g['rtmObj'] = rtmObj;
            }
            // Now create the checkbox list
            if (isCheckBoxesListCreated == false) {
                var genSelectionDiv = document.getElementById('genSelectionDiv');
                genSelectionDiv.innerHTML = '';
                for (var k = 0; k < rtmObj["gen_names"].length; k++) {
                    var genName = rtmObj["gen_names"][k];
                    //check if the genName is a desired one
                    var checkedString = '';
                    if (initialDesiredGenerators.indexOf(genName) > -1) {
                        checkedString = ' checked';
                    }
                    genSelectionDiv.innerHTML += '<label style="margin-right:20px"><input type="checkbox" class="gen_select" onclick="updatePlot()"' + checkedString + ' value="' + genName + '"> ' + genName + '</label>';
                }
                isCheckBoxesListCreated = true;
            }
            global_g['plot_title'] = ' for date ' + date_str + ' and Revision ' + rev;
            updatePlots();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': error in fetching RTM ...';
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
    updatePlots();
}

function deselectAllGen() {
    var genSelectionElements = document.getElementsByClassName("gen_select");
    for (var i = 0; i < genSelectionElements.length; i++) {
        genSelectionElements[i].checked = false;
    }
    updatePlots();
}

function getSelectedGenerators() {
    // find the required generators from checkboxes
    var genSelectionElements = document.getElementsByClassName("gen_select");
    var activeGenerators = [];
    for (var i = 0; i < genSelectionElements.length; i++) {
        var isCheckedStatus = genSelectionElements[i].checked;
        if (typeof isCheckedStatus != "undefined" && isCheckedStatus == true) {
            activeGenerators.push(genSelectionElements[i].value);
        }
    }
    return activeGenerators;
}

function updatePlots() {
    var rtmObj = global_g['rtmObj'];

    var activeGenerators = getSelectedGenerators();
    // Plot the RTM values
    var dcPlotsDiv = document.getElementById("dcPlotsDiv");
    dcPlotsDiv.innerHTML = '';

    var xLabels = rtmObj["time_blocks"].map(Number);
    var traces = [];
    var div = document.createElement('div');
    div.className = 'sch_plot_div';
    div.id = 'plotDiv_0';
    div.style.border = '1px gray dashed';
    dcPlotsDiv.appendChild(div);
    // initialize netRtmVals array
    var netRtmVals = [];
    for (var k = 0; k < rtmObj["gen_names"].length; k++) {
        // dynamically create divs - https://stackoverflow.com/questions/14094697/javascript-how-to-create-new-div-dynamically-change-it-move-it-modify-it-in
        genName = rtmObj["gen_names"][k];
        if (activeGenerators.length != 0 && activeGenerators.indexOf(genName) == -1) {
            continue;
        }
        var schVals = (rtmObj[genName]['rtm']).map(Number);
        traces.push({
            x: xLabels,
            y: schVals,
            type: 'bar',
            name: genName
        });
        if (netRtmVals.length == 0) {
            netRtmVals = schVals
        } else {
            // adding 2 arrays - https://stackoverflow.com/questions/24094466/javascript-sum-two-arrays-in-single-iteration
            netRtmVals = netRtmVals.map(function (num, idx) {
                return num + schVals[idx];
            });
            /* for (let schIter = 0; schIter < schVals.length; schIter++) {
                netRtmVals[schIter] += schVals[schIter];

            } */
        }
    }
    // adding net rtm line plot
    traces.push({
        x: xLabels,
        y: netRtmVals.map(formatter.format),
        type: 'lines',
        line: {
            width: 3
        },
        name: 'Net RTM'
    });

    var layout = {
        title: "RTM" + global_g['plot_title'],
        xaxis: {
            title: 'Block Number',
            dtick: 4
        },
        yaxis: {
            title: 'RTM'
        },
        legend: {
            font: {
                "size": "10"
            },
            orientation: "h"
        },
        barmode: 'relative',
        margin: { 't': 35 },
        height: 800
    };
    Plotly.newPlot(div, traces, layout);
    div
        .on('plotly_hover', function (data) {
            if (data.points.length > 0) {
                var pointIndex = data.points[0]['pointNumber'];
                var textDataArray = document.getElementById("plotDiv_0").data;
                var infoStrings = [];
                for (var i = textDataArray.length - 1; i >= 0; i--) {
                    var rtmVal = +textDataArray[i]['y'][pointIndex]
                    if (rtmVal != 0) {
                        infoStrings.push(textDataArray[i]['name'] + " ( " + textDataArray[i]['y'][pointIndex] + " )");
                    }
                }
                document.getElementById("reserveInfoDiv").innerHTML = "BLOCK (" + data.points[0]['x'] + ')<div style="height: 5px"></div>' + infoStrings.join('<div style="height: 5px"></div>');
            }
        })
        .on('plotly_unhover', function (data) {
            //document.getElementById("reserveInfoDiv").innerHTML = '';
        });

    document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': fetching, table, plot update done!';
}