/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

/* Dynamic Charts */
var initialLoadingSpanValue;
var loadingSpanValue;
var loadingSpan;
var output;

$(document).ready(function() {
    /* Action listener for creating the "dynamic-content-chart" */
    loadingSpanValue = "Initializing visual data";
    $('#draw_graphic').on('click', function() {
        var dimension = $('#dimension').val();
        var measure = $('#measure').val();
        $('#output_button').hide();
        initialLoadingSpanValue = "Initializing visual data [dimension: " + dimension + "] | [measure: " + measure + "]";
        loadingSpanValue = initialLoadingSpanValue;
        refresh(dimension, measure);
    });

    /* Opens a popup with the JSON response (DEBUG) */
    $('#output_button').on('click', function() {
        var modal = bootbox.alert('<textarea style="width: 1100px; height: 700px; " id="output">' + JSON.stringify(output, undefined, 2) + '</textarea>');
        modal.find('.modal-content').css({'width': '1200px', 'margin-left': '-300px'});
    });
});


/**
 * Sets the status text for the "dynamic-content-chart".
 * 
 * Status equals to the status message to be shown.
 * Color equals to the color the message needs to have. Defaults to black. 
 * 
 * @param String status
 * @param String color
 */
function setStatus(status, color) {
    $('#dynamic_status').css('color', 'black');
    if (color) {
        $('#dynamic_status').css('color', color);
    }
    $('#selectableGraphicContainer').text("");
    $('#dynamic_status').text(status);
}

/**
 * --DEPRECATED--
 * 
 * Updates the loading message by adding dots towards the loading-String. Used
 * to give feedback for the 'dynamic-content' chart.
 */
function setLoadingMessage() {
    if (loadingSpanValue.length === (+initialLoadingSpanValue.length + 3)) {
        loadingSpanValue = initialLoadingSpanValue; //24
    }
    else if (loadingSpanValue.length === (+initialLoadingSpanValue.length + 2)) {
        loadingSpanValue += ".";
    } else if (loadingSpanValue.length === (+initialLoadingSpanValue.length + 1)) {
        loadingSpanValue += ".";
    } else {
        loadingSpanValue += ".";
    }
    setStatus(loadingSpanValue);
}


function refresh(dimension, measure, container) {
    if (!container) {
        container = "selectableGraphicContainer";
    }
    dimensionData = [dimension];
    measureData = [measure];
    $('#dynamic-chart-spinner').fadeTo(1000, '1');
    var interval = setInterval(setLoadingMessage, 500);
    $.ajax({
        url: '/application/api/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensionData, measure: measureData},
        dataType: 'json',
        success: function(resp) {
            output = resp;

            if (resp) {
                if (resp[0]) {
                    if (resp[0]['data']) {
                        if (resp[0]['data']) {
                            var series = [];
                            var categories = [];
                            // var dimension = dimension;
                            //var measure = measure[0];
                            //var measure = resp['params'][0]['measures'][0];
                            console.log(resp[0]['data'].length);
                            $.each(resp[0]['data'], function(i, data) {
                                if (i > 50) {
                                    return;
                                }
                                
                                series.push({y: parseFloat(data[measure]), name: data[dimension]});
                                categories.push(data[dimension]);

                            });

                            if (series.length > 0) {

                                var options = {
                                    chart: {
                                        renderTo: container,
                                        zoomType: 'xy',
                                        type: 'column'

                                    },
                                    title: {
                                        text: '<div>Dimension: ' + dimension + ", Measure: " + measure + '</div>'
                                    },
                                    xAxis: {
                                        type: 'category',
                                        labels: {
                                            rotation: -45
                                        },
                                        allowDecimals: true,
                                        categories: categories,
                                    },
                                    yAxis: {
                                        type: 'linear',
                                        allowDecimals: true
                                    },
                                    tooltip: {
                                        shared: false,
                                    },
                                    plotOptions: {
                                        series: {
                                            allowPointSelect: true//,
                                                    //connectNulls: true
                                        }
                                    },
                                    series: [{
                                            name: measure,
                                            data: series
                                        }]



                                };

                                var chart = new Highcharts.Chart(options);
                            } else {
                                setStatus("No data was found with this combination [dimension: " + dimension + "] | [measure: " + measure + "] . If you think this is incorrect, please contact us.", 'orange');
                            }
                            return;
                        }
                    }

                }
            }
            console.log(resp);
            setStatus("An error occurred. Please try again. If this wasn't the first error with this combination, please contact us.", 'red');
        },
        error: function(resp) {
            console.log("ERROR:");
            console.log(resp);
            setStatus("An error occurred. Please try again. If this wasn't the first error with this combination, please contact us.", 'red');
            setTimeout(function() {
                refresh(dimension, measure, container);
            }, 30000);
        },
        complete: function() {
            removeInterval(interval);
            $('#output_button').show();
            $('#dynamic-chart-spinner').fadeTo(1000, '0');

        }
    });

    function removeInterval(interval) {
        clearInterval(interval);
        $('#loading').hide();
    }
}