var realTimeValueTimeOut;
var realTimeValueAjax;
$(document).ready(function() {

});

function getRealTimeValues(siteIds) {
    if (realTimeValueAjax) {
        realTimeValueAjax.abort();
    }
    var methods = [{method: "Live.getCounters", params: {lastMinutes: 1}}];
    realTimeValueAjax = $.ajax({
        url: '/application/api/call-data',
        method: 'POST',
        data: {methods: methods, siteIds: siteIds},
        dataType: 'json',
        success: function(resp) {
            var dateObject = new Date();
            $('#real-time-update-text').text("Last updated (h/m/s): " + addZero(dateObject.getHours()) + ":" + addZero(dateObject.getMinutes()) + ":" + addZero(dateObject.getSeconds()));
            $('#actions-count').text(resp[0][0]['actions']);
            $('#visitors-count').text(resp[0][0]['visitors']);
            $('#visits-count').text(resp[0][0]['visits']);
            $('#visits-converted-count').text(resp[0][0]['visitsConverted']);
        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            realTimeValueTimeout = setTimeout(function() {
                getRealTimeValues(siteIds);
            }, 60000);

        }
    });
}

function showRealTimeValues() {
    //$('#real-time-values-row').css('display', 'block');
    $('#real-time-values-row').slideDown(500, function() {
        $('#real-time-values-row').fadeTo(1000, 1);
    });


}

function hideRealTimeValues() {
    if ($('#real-time-values-row').is(':visible')) {
        clearTimeout(realTimeValueTimeOut);

        $('#real-time-values-row').fadeTo(1000, 0, function() {
            $('#real-time-values-row').slideUp();
            //$('#real-time-values-row').css('display', 'none');
        });
    }

}