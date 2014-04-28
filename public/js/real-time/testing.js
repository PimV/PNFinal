/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

$(document).ready(function() {
    /* Action listener for the 'submit'-button */
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

/**
 * Send/retrieve data from the API using a simple call to a test-function 
 * in /visualization/advertiser/test-data.
 * 
 * @param String dimension
 * @param String measure
 * @param Array beaconIds
 */
function sendData(dimension, measure, beaconIds) {
    console.log("Sending data...");
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
