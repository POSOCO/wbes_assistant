var marginReloadTimerId = null;
var marginReloadMills = 600000; // 10 mins

function stopMarginTimer() {
    clearInterval(marginReloadTimerId);
}

function updateMarginTimerPeriod(periodMilli) {
    marginReloadMills = periodMilli;
}

function restartTimer(timerFunc) {
    stopMarginTimer();
    marginReloadTimerId = setInterval(timerFunc, marginReloadMills);
}

function updateTimerPeriodFromUI(marginFetchPeriodInputId) {
    var marginFetchPeriodInput = document.getElementById(marginFetchPeriodInputId);
    if (marginFetchPeriodInput) {
        var marginFetchPeriodMins = marginFetchPeriodInput.value;
        updateMarginTimerPeriod(marginFetchPeriodMins * 60 * 1000);
    }
}

