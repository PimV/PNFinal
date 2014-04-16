var initialLoadingSpanValue;
var loadingSpanValue;
var loadingSpan;
$(document).ready(function() {

    loadingSpanValue = "Initializing visual data";
    $('#submit').on('click', function() {
        var dimension = $('#dimensions').val();
        var measure = $('#measures').val();
        var beaconIds = $('#beaconIds').val().split(',');
        sendData(dimension, measure, beaconIds);
    });
});


function setStatus(status, color) {
    $('#graph_status').css('color', 'black');
    if (color) {
        $('#graph_status').css('color', color);
    }
    $('#selectableGraphicContainer').text("");
    $('#graph_status').text(status);
}

function setLoadingMessage() {
}

function sendData(dimension, measure, beaconIds) {
    console.log("Sending data...");
    $.ajax({
        url: '/visualization/advertiser/test-data',
        method: 'POST',
        data: {dimension: dimension, measure: measure, beaconIds: beaconIds},
        dataType: 'json',
        success: function(resp) {
            $('#output').text(JSON.stringify(resp, undefined, 2));
        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            console.log("Completed");
        }
    });


}
