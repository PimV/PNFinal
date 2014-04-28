/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var initialLoadingSpanValue;
var loadingSpanValue;
var loadingSpan;
$(document).ready(function() {
    loadingSpanValue = "Initializing visual data";
    $('#submit').on('click', function() {
        var dimension = $('#dimensions').val();
        var measure = $('#measures').val();
        var beaconIds = $('#beaconIds').val().split(',');
        if ($('#beaconIds').val().length < 1) {
            beaconIds = null;
        }
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


function sendData(dimension, measure, beaconIds) {
    console.log("Sending data...");
    console.log(beaconIds);
    $.ajax({
        url: '/visualization/advertiser/test-data',
        method: 'POST',
        data: {dimension: dimension, measure: measure, beaconIds: beaconIds},
        dataType: 'json',
        success: function(resp) {
            console.log(resp['response']['data'][0]['data'].length);
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
