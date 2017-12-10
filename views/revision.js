/**
 * Created by Nagasudhir on 12/10/2017.
 */
function refreshRevisions() {
    var date_str = document.getElementById('date_input').value;
    $.ajax({
        //fetch revisions from sever
        url: "./api/revisions?date_str=" + date_str,
        type: "GET",
        dataType: "json",
        success: function (revListObj) {
            //toastr["info"]("Surrenders fetch result is " + JSON.stringify(data.categories));
            document.getElementById('fetchStatusLabel').innerHTML = 'Revisions fetched!';
            console.log("Revisions fetched are " + JSON.stringify(revListObj));
            var revListArray = revListObj['revisions'];
            if (typeof revListArray != 'undefined' && revListArray != null && revListArray.length > 0) {
                updateRevsList(revListArray);
                document.getElementById('fetchStatusLabel').innerHTML = 'Revisions updated!';
            } else {
                document.getElementById('fetchStatusLabel').innerHTML = 'fetching done, revisions not found!';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById('fetchStatusLabel').innerHTML = 'error in fetching revisions...';
            console.log(textStatus, errorThrown);
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