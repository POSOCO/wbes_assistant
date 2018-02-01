/**
 * Created by Nagasudhir on 12/5/2017.
 */
window.onload = doOnLoadStuff();

function doOnLoadStuff() {
    document.getElementById('date_input').value = dateStr_;
    updateRevsList(revs_);
    var utilSelEl = document.getElementById("utils");
    option = document.createElement("option");
    option.text = 'ALL';
    option.value = 'ALL';
    option.setAttribute('data-is_seller', 'true');
    utilSelEl.add(option);
    for (var i = 0; i < utilsObj_['sellers'].length; i++) {
        var option = document.createElement("option");
        option.text = utilsObj_['sellers'][i]['Acronym'];
        option.value = utilsObj_['sellers'][i]['UtilId'];
        option.setAttribute('data-is_seller', 'true');
        utilSelEl.add(option);
    }
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

function netSchDcGenNameMap(acr) {
    var searchArray = ["CGPL", "GANDHAR-APM", "GANDHAR-NAPM", "GANDHAR-RLNG", "KAPS", "KAWAS-APM", "KAWAS-NAPM", "KAWAS-RLNG", "KAWAS-zLIQ", "KSTPS I&II", "KSTPS7", "MOUDA", "MOUDA_II", "NSPCL", "RGPPL_IR", "RGPPL-GAS", "RGPPL-RLNG", "SASAN", "SIPAT I", "SIPAT II", "SOLAPUR", "SSP", "TAPS-I", "TAPS-II", "VSTPS I", "VSTPS II", "VSTPS III", "VSTPS IV", "VSTPS V"];
    var sourceArray = ["CGPL", "GANDHAR-APM", "GANDHAR-NAPM", "GANDHAR-RLNG", "KAPS", "KAWAS-APM", "KAWAS-NAPM", "KAWAS-RLNG", "KAWAS-zLIQ", "KSTPS_I&II", "KSTPS7", "MOUDA", "MOUDA_II", "NSPCL", "RGPPL_IR", "RGPPL-GAS", "RGPPL-RLNG", "SASAN", "SIPAT_I", "SIPAT_II", "SOLAPUR", "SSP", "TAPS-I", "TAPS-II", "VSTPS_I", "VSTPS_II", "VSTPS_III", "VSTPS_IV", "VSTPS_V"];
    var searchUtilIndex = null;
    // find the entry in source array for util Id
    for (var i = 0; i < sourceArray.length; i++) {
        if (sourceArray[i] == acr) {
            searchUtilIndex = i;
            break;
        }
    }

    if (searchUtilIndex == null) {
        return null;
    }

    return searchArray[searchUtilIndex];
}

function getRRAS() {
    var dcPlotsDiv = document.getElementById("dcPlotsDiv");
    dcPlotsDiv.innerHTML = '';
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
                var dcSchMatrixObj = {};

                var genNames = netSchMatrixObj["gen_names"];
                dcSchMatrixObj["gen_names"] = netSchMatrixObj["gen_names"];
                dcSchMatrixObj["time_blocks"] = netSchMatrixObj["time_blocks"];

                for (var i = 0; i < genNames.length; i++) {
                    // genNames is net sch acronym and dcGenNames is dc acronym
                    dcSchMatrixObj[genNames[i]] = {};
                    dcSchMatrixObj[genNames[i]]['rras'] = netSchMatrixObj[genNames[i]]['rras'];
                }

                var displayStartBlk = Number(document.getElementById('from_blk').value);
                var displayEndBlk = Number(document.getElementById('to_blk').value);

                // create header with utilNames
                var row = [''];
                var row2 = ['TB'];

                for (var i = 0; i < dcSchMatrixObj["gen_names"].length; i++) {
                    var genName = dcSchMatrixObj["gen_names"][i];
                    row = row.concat([genName]);
                    row2 = row2.concat(['RRAS']);
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
                        var rrasVal = (+dcSchMatrixObj[genName]['rras'][blk - 1]).toFixed(0);
                        row = row.concat([rrasVal]);
                    }
                    resMatrix.push(row);
                }
                //console.log(resMatrix);
                createTable(resMatrix, document.getElementById('dcTable'));
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching and table update done!';

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
                    //stub todo create the margins plot
                    var genName = dcSchMatrixObj["gen_names"][k];
                    traces.push({
                        x: xLabels,
                        y: (dcSchMatrixObj[genName]['rras']).map(Number),
                        fill: 'tonexty',
                        name: genName
                    });
                }
                traces[0].fill = 'tozeroy';
                var layout = {
                    title: 'RRAS for date ' + date_str + ' and Revision ' + rev,
                    xaxis: {
                        title: 'Block Number',
                        dtick: 4
                    },
                    yaxis: {
                        title: 'RRAS'
                    },
                    legend: {
                        font: {
                            "size": "10"
                        },
                        orientation: "h"
                    },
                    margin: {'t': 35},
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