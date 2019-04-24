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
    getSchDataOfGenForDates(utilId, from_date_str, to_date_str, function(err, schData){
        if (err) {
            return console.log(err);
        }
        console.log(schData);
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
                        for (var k = 1; k < 96; k++) {
                            dcSchMatrixObj[dcGenNames[i]]['sch_change'][k] = +dcSchMatrixObj[dcGenNames[i]]['total'][k] - +netSchMatrixObj[genNames[i]]['total'][k - 1];
                        }
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