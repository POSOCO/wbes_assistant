/**
 * Created by Nagasudhir on 12/5/2017.
 */
window.onload = doOnLoadStuff();

function doOnLoadStuff() {
    document.getElementById('from_date_input').value = dateStr_;
    document.getElementById('to_date_input').value = dateStr_;
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

function getSchedules() {
    var utilSelEl = document.getElementById("utils");
    var utilId = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('value');
    var from_date_str = document.getElementById('from_date_input').value;
    var to_date_str = document.getElementById('to_date_input').value;
    getSchDataOfGenForDates(utilId, from_date_str, to_date_str, function (err, schData) {
        if (err) {
            return console.log(err);
        }
        console.log(schData);
        var reqSchData = derivePlotData(schData);
        plotData(reqSchData);
    });
}

function getSchDataOfGenForDates(utilId, from_date_str, to_date_str, callback) {
    var queryStrs = [];
    queryStrs.push("util_id=" + utilId);
    queryStrs.push("from_date_str=" + from_date_str);
    queryStrs.push("to_date_str=" + to_date_str);
    queryStrs.push("is_seller=true");
    $.ajax({
        //fetch categories from sever
        url: "./api/net_sch_for_dates" + "?" + queryStrs.join("&"),
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

            if (netSchMatrixObj['gen_names'].length > 0) {
                // todo copy the dcMatrixObj for adding schedules also
                // var dcSchMatrixObj = dcMatrixObj;
                // initialise the net schedule attributes of the dcSchMatrixObj to 0
                var zeroValues = function () {
                    var zeroValuesArray = [];
                    for (var i = 0; i < 96; i++) {
                        zeroValuesArray.push(0);
                    }
                    return zeroValuesArray;
                };
                var genNames = netSchMatrixObj["gen_names"];
                var dcGenNames = [];
                var dcSchMatrixObj = {};
                for (var i = 0; i < genNames.length; i++) {
                    dcSchMatrixObj[genNames[i]] = {};
                    var sch_cols = ['isgs', 'mtoa', 'lta', 'stoa', 'iex', 'pxi', 'urs', 'rras', 'sced', 'total', 'sch_change'];
                    for (let sch_col_iter = 0; sch_col_iter < sch_cols.length; sch_col_iter++) {
                        const sch_col = sch_cols[sch_col_iter];
                        dcSchMatrixObj[genNames[i]][sch_col] = zeroValues();
                    }
                }

                for (var i = 0; i < genNames.length; i++) {
                    //var dcUtilAcronym = acronymFromNetSchAcronym(genNames[i]);
                    var dcUtilAcronym = netSchDcGenNameMap(genNames[i]);
                    if (dcUtilAcronym == null) {
                        dcUtilAcronym = genNames[i];
                    }
                    dcGenNames.push(dcUtilAcronym);
                }

                dcSchMatrixObj['gen_names'] = dcGenNames;
                dcSchMatrixObj['times'] = netSchMatrixObj['times'];

                for (var i = 0; i < genNames.length; i++) {
                    // genNames is net sch acronym and dcGenNames is dc acronym
                    if (dcSchMatrixObj[dcGenNames[i]] != undefined) {
                        dcSchMatrixObj[dcGenNames[i]]['isgs'] = netSchMatrixObj[genNames[i]]['isgs'];
                        dcSchMatrixObj[dcGenNames[i]]['mtoa'] = netSchMatrixObj[genNames[i]]['mtoa'];
                        dcSchMatrixObj[dcGenNames[i]]['lta'] = netSchMatrixObj[genNames[i]]['lta'];
                        dcSchMatrixObj[dcGenNames[i]]['stoa'] = netSchMatrixObj[genNames[i]]['stoa'];
                        dcSchMatrixObj[dcGenNames[i]]['iex'] = netSchMatrixObj[genNames[i]]['iex'];
                        dcSchMatrixObj[dcGenNames[i]]['pxi'] = netSchMatrixObj[genNames[i]]['pxi'];
                        dcSchMatrixObj[dcGenNames[i]]['urs'] = netSchMatrixObj[genNames[i]]['urs'];
                        dcSchMatrixObj[dcGenNames[i]]['rras'] = netSchMatrixObj[genNames[i]]['rras'];
                        dcSchMatrixObj[dcGenNames[i]]['sced'] = netSchMatrixObj[genNames[i]]['sced'];
                        dcSchMatrixObj[dcGenNames[i]]['total'] = netSchMatrixObj[genNames[i]]['total'];
                    } else {
                        // todo handle separately if dc gen name of a corresponding net sch gen name is not found
                    }
                }
                // console.log(dcSchMatrixObj);
                // console.log(netSchMatrixObj);
                // document.getElementById('fetchStatusLabel').innerHTML = 'fetching and table update done!';
                callback(null, dcSchMatrixObj);
            } else {
                //document.getElementById('fetchStatusLabel').innerHTML = 'fetching done, net schedules values not found...';
                callback(new Error("net schedule fetching done, net schedules values not found..."));
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // document.getElementById('fetchStatusLabel').innerHTML = 'error in fetching net schedules...';
            // console.log(textStatus, errorThrown);
            callback(errorThrown);
            // toastr.error("The error from server for surrenders fetch is --- " + jqXHR.responseJSON.message);
        }
    });
}

function derivePlotData(schData) {
    var genNames = schData['gen_names'];
    // for each generator, derive the sch_change and sch_change without sced
    for (let genIter = 0; genIter < genNames.length; genIter++) {
        const genName = genNames[genIter];
        schData[genName]['sch_change'] = [0];
        schData[genName]['sch_change_excl_sced'] = [0];
        for (let timeBlkIter = 1; timeBlkIter < schData['times'].length; timeBlkIter++) {
            schData[genName]['sch_change'][timeBlkIter] = +schData[genName]['total'][timeBlkIter] - +schData[genName]['total'][timeBlkIter - 1];
            schData[genName]['sch_change_excl_sced'][timeBlkIter] = +schData[genName]['total'][timeBlkIter] - +schData[genName]['sced'][timeBlkIter] - +schData[genName]['total'][timeBlkIter - 1] + +schData[genName]['sced'][timeBlkIter - 1];
        }
    }
    return schData;
}

function plotData(schData) {
    var from_date_str = document.getElementById('from_date_input').value;
    var to_date_str = document.getElementById('to_date_input').value;
    for (let genIter = 0; genIter < schData['gen_names'].length; genIter++) {
        const genName = schData['gen_names'][genIter];
        var div = document.createElement('div');
        div.className = 'sch_plot_div';
        div.id = 'plotDiv_' + genName;
        div.style.border = '1px gray dashed';
        var dcPlotsDiv = document.getElementById("dcPlotsDiv");
        dcPlotsDiv.appendChild(div);
        var traces = [];
        var reqColsList = ['sch_change', 'sch_change_excl_sced'];
        for (let reqColInd = 0; reqColInd < reqColsList.length; reqColInd++) {
            const reqCol = reqColsList[reqColInd];
            traces.push({
                x: schData['times'],
                y: (schData[genName][reqCol]).map(Number),
                name: reqCol
            });
        }
        var layout = {
            title: genName + ' plots from ' + from_date_str + ' to ' + to_date_str,
            xaxis: {
                title: ''
            },
            yaxis: {
                title: 'MW'
            },
            legend: {
                font: {
                    "size": "20"
                },
                orientation: "h"
            },
            margin: { 't': 35 },
            height: 500
        };
        Plotly.newPlot(div, traces, layout);

        // find the mileage values
        var schMileage = 0;
        var schExclScedMileage = 0;
        var schChangeCount = 0;
        var schExclScedChangeCount = 0;
        for (let blkIter = 1; blkIter < schData['times'].length; blkIter++) {
            const schChangeVal = Math.abs(schData[genName]['sch_change'][blkIter]);
            const schExclScedChangeVal = Math.abs(schData[genName]['sch_change_excl_sced'][blkIter]);
            schMileage += schChangeVal;
            schExclScedMileage += schExclScedChangeVal;
            if (schChangeVal > 0) {
                schChangeCount += 1;
            }
            if (schExclScedChangeVal > 0) {
                schExclScedChangeCount += 1;
            }
        }

        var mileageSpan = document.createElement('span');
        mileageSpan.innerHTML = "Mileage with SCED = " + schMileage.toFixed(0);
        mileageSpan.innerHTML += "<br> Mileage without SCED = " + schExclScedMileage.toFixed(0);
        mileageSpan.innerHTML += "<br> Sch changes with SCED = " + schChangeCount;
        mileageSpan.innerHTML += "<br> Sch changes without SCED = " + schExclScedChangeCount;

        // append output text to plot div
        div.appendChild(mileageSpan);
    }

}