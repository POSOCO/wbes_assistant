/**
 * Created by Nagasudhir on 4/14/2018.
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

function getURSSummary() {
    var revSelEl = document.getElementById("revisions");
    var rev = revSelEl.options[revSelEl.selectedIndex].value;
    var utilSelEl = document.getElementById("utils");
    var utilId = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('value');
    var date_str = document.getElementById('date_input').value;
    var from_str = document.getElementById('from_blk').value;
    var to_str = document.getElementById('from_blk').value;
    var queryStrs = [];
    queryStrs.push("util_id=" + utilId);
    queryStrs.push("rev=" + rev);
    queryStrs.push("date_str=" + date_str);
    queryStrs.push("from=" + date_str);
    queryStrs.push("to=" + date_str);
    document.getElementById('fetchStatusLabel').innerHTML = 'fetching URS Summary data...';
    $.ajax({
        //fetch categories from sever
        url: "./api/urs_summary" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (URSSummaryObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = 'fetching URS summary done!';
            //console.log("DC Object fetched is " + JSON.stringify(URSSummaryObj));
            // check if URSSummaryObj is correct
            if (URSSummaryObj == undefined || URSSummaryObj == null || URSSummaryObj['summary_array'] == undefined) {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching urs summary done, but response not as desired...';
                return;
            }
            var summaryArray = URSSummaryObj['summary_array'];
            if (summaryArray.length > 0) {
                //console.log(summaryArray);
                var resMatrix = [];
                for (var i = 0; i < summaryArray.length; i++) {
                    resMatrix.push([summaryArray[i][0], summaryArray[i][1].replace("_Beneficiary", ""), summaryArray[i][2] + " - " + summaryArray[i][3]]);
                }
                createTable(resMatrix, document.getElementById('summaryTable'));
                document.getElementById('fetchStatusLabel').innerHTML = 'URS summary fetching and table update done!';
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