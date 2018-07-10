/**
 * Created by Nagasudhir on 12/10/2017.
 */
function refreshRevisions() {
    refreshRevisionsCb(function (err, revListArray) {
        // do something
    });
}

function refreshRevisionsCb(callback) {
    var date_str = document.getElementById('date_input').value;
    $.ajax({
        //fetch revisions from sever
        url: "./api/revisions_nr?date_str=" + date_str,
        type: "GET",
        dataType: "json",
        success: function (revListObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': Revisions fetched!';
            //console.log("Revisions fetched are " + JSON.stringify(revListObj));
            var revListArray = revListObj['revisions'];
            if (typeof revListArray != 'undefined' && revListArray != null && revListArray.length > 0) {
                updateRevsList(revListArray);
                document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': Revisions updated!';
                callback(null,revListArray);
            } else {
                var errStr = (new Date()).toLocaleString() + ': fetching done, revisions not found!';
                document.getElementById('fetchStatusLabel').innerHTML = errStr;
                callback(new Error(errStr));
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById('fetchStatusLabel').innerHTML = (new Date()).toLocaleString() + ': error in fetching revisions...';
            console.log(textStatus, errorThrown);
            callback(errorThrown);
            // toastr.error("The error from server for surrenders fetch is --- " + jqXHR.responseJSON.message);
        }
    });
}

function updateRevsList(revsArray) {
    var revSelEl = document.getElementById("revisions");
    // clear all the options
    revSelEl.innerHTML = '';
    // populate revisions
    for (var i = 0; i < revsArray.length; i++) {
        var option = document.createElement("option");
        option.text = revsArray[i];
        option.value = revsArray[i];
        revSelEl.add(option);
    }
}