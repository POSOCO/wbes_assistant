/**
 * Created by Nagasudhir on 12/5/2017.
 */
window.onload = doOnLoadStuff();

function doOnLoadStuff() {
    document.getElementById('date_input').value = dateStr_;
    var revSelEl = document.getElementById("revisions");
    for (var i = 0; i < revs_.length; i++) {
        var option = document.createElement("option");
        option.text = revs_[i];
        option.value = revs_[i];
        revSelEl.add(option);
    }
    var utilSelEl = document.getElementById("utils");
    for (var i = 0; i < utilsObj_['sellers'].length; i++) {
        var option = document.createElement("option");
        option.text = utilsObj_['sellers'][i]['Acronym'];
        option.value = utilsObj_['sellers'][i]['UtilId'];
        option.setAttribute('data-is_seller', 'true');
        utilSelEl.add(option);
    }
    for (var i = 0; i < utilsObj_['buyers'].length; i++) {
        var option = document.createElement("option");
        option.text = utilsObj_['buyers'][i]['Acronym'];
        option.value = utilsObj_['buyers'][i]['UtilId'];
        option.setAttribute('data-is_seller', 'false');
        utilSelEl.add(option);
    }
}

function getSurrenders() {
    var revSelEl = document.getElementById("revisions");
    var rev = revSelEl.options[revSelEl.selectedIndex].value;
    var utilSelEl = document.getElementById("utils");
    var reqTypeSelEl = document.getElementById("req_type");
    var isSeller = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('data-is_seller');
    var utilId = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('value');
    var date_str = document.getElementById('date_input').value;
    var from_blk_str = document.getElementById('from_blk').value;
    var to_blk_str = document.getElementById('to_blk').value;
    var req_type = reqTypeSelEl.options[reqTypeSelEl.selectedIndex].getAttribute('value');
    var queryStrs = [];
    queryStrs.push("util_id=" + utilId);
    queryStrs.push("rev=" + rev);
    queryStrs.push("is_seller=" + isSeller);
    queryStrs.push("date_str=" + date_str);
    queryStrs.push("from=" + from_blk_str);
    queryStrs.push("to=" + to_blk_str);
    queryStrs.push("req_type=" + req_type);
	document.getElementById('fetchStatusLabel').innerHTML = 'fetching data...';
    $.ajax({
        //fetch categories from sever
        url: "./api/surrenders" + "?" + queryStrs.join("&"),
        type: "GET",
        dataType: "json",
        success: function (utilSurrObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
			document.getElementById('fetchStatusLabel').innerHTML = 'fetching done!';
            console.log("Surrenders fetched are " + JSON.stringify(utilSurrObj));
            // create header with utilNames
            var resMatrix = [];
            if (utilSurrObj.utilNames.length > 0) {
                var displayStartBlk = Number(document.getElementById('from_blk').value);
                var displayEndBlk = Number(document.getElementById('to_blk').value);
                var blankValsRow = [];
                for (var k = 0; k < utilSurrObj.utilNames.length; k++) {
                    blankValsRow.push("");
                }
                resMatrix.push(['TB'].concat(utilSurrObj.utilNames));
                for (var i = 0; i < (displayEndBlk - displayStartBlk + 1); i++) {
                    resMatrix.push([(displayStartBlk + i)].concat(blankValsRow));
                }
                for (var i = 0; i < utilSurrObj.blks.length; i++) {
                    var utilSurrBlkVals = utilSurrObj.blks[i].values;
                    for (var k = 0; k < utilSurrBlkVals.length; k++) {
                        var blk = Number(utilSurrBlkVals[k]["blk"]);
                        //translate the blk to table Row
                        var tableRowNum = blk - displayStartBlk + 1;
                        var surr = Number(utilSurrBlkVals[k]["ent"]) - Number(utilSurrBlkVals[k]["req"]);
                        surr = surr.toFixed(0);
                        resMatrix[tableRowNum][i + 1] = surr;
                    }
                }
                console.log(resMatrix);
                createTable(resMatrix, document.getElementById('surrenderTable'));
				document.getElementById('fetchStatusLabel').innerHTML = 'fetching and table update done!';
            } else{
				document.getElementById('fetchStatusLabel').innerHTML = 'fetching done, no surrenders observed!';
			}
        },
        error: function (jqXHR, textStatus, errorThrown) {
			document.getElementById('fetchStatusLabel').innerHTML = 'error in fetching...';
            console.log(textStatus, errorThrown);
            // toastr.error("The error from server for surrenders fetch is --- " + jqXHR.responseJSON.message);
        }
    });
}

function createTable(tableData, tableEl) {
    // delete all table rows
    while (tableEl.rows.length > 0) {
        tableEl.deleteRow(0);
    }
    tableData.forEach(function (rowData) {
        var row = document.createElement('tr');

        rowData.forEach(function (cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableEl.appendChild(row);
    });
}