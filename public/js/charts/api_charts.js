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

/* ViewsOverTime */
var viewsOverTimeChart;
var viewsOverTimeChartOptions;
var viewsOverTimeAjax;
var viewsOverTimeCache;

$(document).ready(function() {

    /* Action listener for any overlay. Fades in the overlay on hover, and if the
     user stops hovering, fades the overlay out again. */
    $('.overlay').hover(function() {
        $('.overlay-status').text("Click to enlarge chart");
        if (!$('.overlay').is(':animated')) {
            $('.overlay').css("background", "#FFF");
            $('.overlay').fadeTo(400, '0.5');
        }
    }, function() {
        $('.overlay-status').text("");
        $('.overlay').fadeTo(400, '0.0');

    });

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

    /* Update the views over time chart if date_end changed */
    $('#date_end').blur(function() {
        viewsOverTimeAjax.abort();
        showViewsOverTime();
    });

    /* Update the views over time chart if date_start changed */
    $('#date_start').blur(function() {
        viewsOverTimeAjax.abort();
        showViewsOverTime();
    });

    /* Show and draw views over time on document load */
    showViewsOverTime();

    /* Actionlistener for the overlay. If clicked, opens the popup with an 
     enlarged chart */
    $('.overlay').on('click', function() {
        var box1 = bootbox.alert('<div style="width: 1100px; height: 700px;" id="enlargedChartContainer"></div>');
        box1.find('.modal-content').css({'width': '1200px', 'margin-left': '-300px'});
        enlargeChart($(this).data("chart"), $(this).data("stockChart"));

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


/**
 * Starts the process to show the Views over Time chart. Sends an AJAX request
 * to the desired controller containing the parameters to request the needed 
 * data, or, if available, reads the data from the local cache. 
 * 
 * Container is set default to "views-over-time-graphic" in the 
 * drawVoTChart() method. Can be changed to set it to the popup chart or any
 * other chart.
 * 
 * @param array beaconIds
 * @param String container
 */
function showViewsOverTime(beaconIds, container) {

    $('#view_over_time_status').text("Loading Views over Time chart...");
    var date_start = $('#date_start').val();
    var date_end = $('#date_end').val();
    var series = [];
    var categories = [];
    $('#view_over_time_status').css('z-index', '1');
    $('#views-over-time-graphic').fadeTo(1000, '0.5');
    $('#views-over-time-spinner').fadeTo(1000, '1');

    if (viewsOverTimeCache && !beaconIds) {
        if (new Date(date_start).getTime() < viewsOverTimeCache['date_start'] || new Date(date_end).getTime() > viewsOverTimeCache['date_end']) {
            viewsOverTimeCache = null;
            showViewsOverTime();
        } else {
            var dimension = "date";
            var measure = "flx_pixels_sum";
            $.each(viewsOverTimeCache['data'], function(i, data) {
                if (new Date(data[dimension]).getTime() >= new Date(date_start).getTime() && new Date(data[dimension]).getTime() <= new Date(date_end).getTime()) {
                    series.push({y: parseFloat(data[measure]), x: parseInt((+new Date(data[dimension]).getTime() + (60 * 60 * 1000))), name: data[dimension]});
                    categories.push(data[dimension]);
                }
            });

            drawVoTChart(series, categories, container);
        }
    } else {
        if (viewsOverTimeAjax) {
            viewsOverTimeAjax.abort();
        }
        viewsOverTimeAjax = $.ajax({
            url: '/visualization/advertiser/views-over-time',
            method: 'POST',
            data: {date_start: date_start, date_end: date_end, beaconIds: beaconIds},
            dataType: 'json',
            success: function(resp) {

                if (resp && resp[0] && resp[0]['data']) {
                    /* Store data into the local object cache */
                    viewsOverTimeCache = [];
                    viewsOverTimeCache['data'] = resp[0]['data'];
                    viewsOverTimeCache['date_start'] = new Date(date_start).getTime();
                    viewsOverTimeCache['date_end'] = new Date(date_end).getTime();
                    viewsOverTimeCache['beacon_ids'] = beaconIds;

                    /* Sets the dimension and date for the views over time chart */
                    var dimension = "date";
                    var measure = "flx_pixels_sum";

                    /* Loop through the received data and create a serie out of
                     this data, to use in Highcharts later on */
                    $.each(resp[0]['data'], function(i, data) {
                        series.push({y: parseFloat(data[measure]), x: parseInt((+new Date(data[dimension]).getTime() + (60 * 60 * 1000))), name: data[dimension]});
                        categories.push(data[dimension]);
                    });

                    /* Calls the method to actually draw the chart */
                    drawVoTChart(series, categories, container);
                    return;
                } else {
                    return;
                }
            },
            error: function(resp) {
                /* Retry to draw the views over time on error within 15 seconds */
                setTimeout(function() {
                    showViewsOverTime(beaconIds);
                }, 15000);
            },
            complete: function() {
                $('#view_over_time_status').css('z-index', '0');
                $('#views-over-time-graphic').fadeTo(1000, '1');
            }
        });
    }
}

/**
 * Draws the Views over Time chart given the serieData, categories and the
 * specific container to draw in.
 * 
 * Container is necessary for the popup chart. 
 * 
 * Loads data from the internal cache if that cache has been set previously.
 * 
 * @param serieObject serieData
 * @param array categories
 * @param String container
 */
function drawVoTChart(serieData, categories, container) {
    if (serieData.length > 0) {
        if (viewsOverTimeChart && !container) {
            /* If the chart is drawn already and the container is not changed, 
             redraw the chart in the same container by changing the serieData. */
            viewsOverTimeChart.series[0].setData(serieData, false, true, true);
            viewsOverTimeChart.redraw();
        } else {
            if (!container) {
                container = "views-over-time-graphic";
            }
            /* Create the chart options object */
            viewsOverTimeChartOptions = {
                chart: {
                    renderTo: container,
                    zoomType: 'xy',
                    type: 'line'
                },
                title: {
                    text: '<div>Views over Time</div>'
                },
                xAxis: {
                    type: 'datetime'
                },
                tooltip: {
                    shared: false
                },
                plotOptions: {
                    series: {
                        allowPointSelect: true
                    }
                },
                series: [{
                        id: "serie_0",
                        name: "Views",
                        data: serieData
                    }]
            };

            /* Create the actual chart */
            viewsOverTimeChart = new Highcharts.StockChart(viewsOverTimeChartOptions);
        }

        $('#view_over_time_status').css('z-index', '0');
        $('#views-over-time-graphic').fadeTo(1000, '1');
        $('#views-over-time-spinner').fadeTo(1000, '0');
    } else {
        $('#view_over_time_status').text("No data found. Please specify a different date range.");
    }
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
        url: '/visualization/advertiser/viz-data-multiple',
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

/**
 * Creates the chart in the popup from the given chartName. Duplicates the 
 * options object from the given chartName and changes the 'renderTo' entry
 * to the popup container.
 * 
 * The stockChart boolean is there to define whether the chart-to-draw is a
 * Highcharts Stockchart or not.
 * 
 * @param String chartName
 * @param boolean stockChart
 */
function enlargeChart(chartName, stockChart) {
    /* Retrieve the chartOptions from the given chartName */
    var actualChartOptions = window[chartName].options;

    /* Change the 'renderTo' entry from the chartOptions */
    actualChartOptions.chart.renderTo = 'enlargedChartContainer';

    /* Initialize the chart */
    var popupChart;
    if (stockChart === true) {
        popupChart = new Highcharts.StockChart(actualChartOptions);
    } else {
        popupChart = new Highcharts.Chart(actualChartOptions);
    }
}
