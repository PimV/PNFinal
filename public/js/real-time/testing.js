/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

$(document).ready(function() {
    /* Action listener for the 'submit'-button */
    $('#submit').on('click', function() {
        var method = $('#method').val();
        var methodParameters = $('#methodParameters').val();
        var siteIds = $('#siteIds').val().split(',');
        if ($('#siteIds').val().length < 1) {
            console.log("No Siteids");
            siteIds = null;
        }
        sendData(method, methodParameters, siteIds);//, measure, beaconIds);
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
function sendData(method, methodParameters, siteIds) {
    console.log("Sending data...");
    methods = [{method: "VisitsSummary.get", params: {period: "range", date: "2014-05-04,2014-05-05"}}, {method: "VisitsSummary.get", params: {period: "range", date: "2014-05-04,2014-05-05"}}];
    $.ajax({
        url: '/application/api/test-data',
        method: 'POST',
        data: {method: method, methodParameters: methodParameters, siteIds: siteIds, methods: methods},
        dataType: 'json',
        success: function(resp) {
            console.log(resp);
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
