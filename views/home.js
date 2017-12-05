/**
 * Created by Nagasudhir on 12/5/2017.
 */
window.onload = doOnLoadStuff();

function doOnLoadStuff() {
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
    var utilSelEl = document.getElementById("utils");
    var isSeller = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('data-is_seller');
    var utilId = utilSelEl.options[utilSelEl.selectedIndex].getAttribute('value');

}