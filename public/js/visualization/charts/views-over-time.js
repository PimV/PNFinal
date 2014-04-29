/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

/* ViewsOverTime */
var viewsOverTimeChart;
var viewsOverTimeChartOptions;
var viewsOverTimeAjax;
var viewsOverTimeCache;

$(document).ready(function() {
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
});

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
    console.log("Getting Views over Time: Started!");

    /* Set variables for the "views-per-city" block */
    var dimensions = ["date"];
    var measures = ["flx_pixels_sum"];
    var orderByDimension = true;
    var orderType = "asc";
    var date_start = $('#date_start').val();
    var date_end = $('#date_end').val();
    var series = [];
    var categories = [];

    /* Set loading visuals */
    $('#views-over-time-status').css('z-index', '1');
    $('#views-over-time-status').text("Loading Views over Time chart...");
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
            //url: '/visualization/advertiser/views-over-time',
            url: '/visualization/advertiser/viz-data-multiple',
            method: 'POST',
            data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, orderByDimension: orderByDimension, orderType: orderType, date_start: date_start, date_end: date_end},
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
                $('#views-over-time-status').css('z-index', '0');
                $('#views-over-time-graphic').fadeTo(1000, '1');
                console.log("Updating Views over Time: Done!");
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

        $('#views-over-time-status').css('z-index', '0');
        $('#views-over-time-graphic').fadeTo(1000, '1');
        $('#views-over-time-spinner').fadeTo(1000, '0');
    } else {
        $('#views-over-time-status').text("No data found. Please specify a different date range.");
    }
}