/**
 * Created by Nagasudhir on 12/5/2017.
 */
window.onload = doOnLoadStuff();

function doOnLoadStuff() {
    createVariableRatesForm();
}

function createVariableRatesForm() {
    var rates = ratesObj_;
    var ratesFormTable = document.getElementById('ratesFormTable');
    // iterate through keys in object - https://stackoverflow.com/questions/684672/how-do-i-loop-through-or-enumerate-a-javascript-object
    for (var gen in rates) {
        if (rates.hasOwnProperty(gen)) {
            rateEntryRow = createRateEntryInput(gen, rates[gen]);
            ratesFormTable.appendChild(rateEntryRow);
        }
    }
}

function createRateEntryInput(gen, genRate) {
    var rateEntryRow = document.createElement('tr');
    var genNameCell = document.createElement('td');
    var genRateCell = document.createElement('td');
    var genNameSpan = document.createElement('span');
    genNameSpan.innerHTML = gen;
    genNameSpan.className += ' gen_name';
    var genRateInp = document.createElement('input');
    genRateInp.value = genRate;
    genRateInp.type = 'number';
    genRateInp.setAttribute('gen', gen);
    genRateInp.className += ' rate_inp';
    genNameCell.appendChild(genNameSpan);
    rateEntryRow.appendChild(genNameCell);
    genRateCell.appendChild(genRateInp);
    rateEntryRow.appendChild(genRateCell);
    return rateEntryRow;
}

function deriveGenRatesPayload() {
    var inpEls = document.getElementsByClassName('rate_inp');
    var ratesPayload = {};
    for (let elInd = 0; elInd < inpEls.length; elInd++) {
        const inpEl = inpEls[elInd];
        var gen_name = inpEl.getAttribute("gen");
        var gen_var_cost = Number(inpEl.value);
        ratesPayload[gen_name] = gen_var_cost;
    }
    return ratesPayload;
}

function submitGenRates() {
    var genRatesObj = deriveGenRatesPayload();
    console.log(genRatesObj);
}