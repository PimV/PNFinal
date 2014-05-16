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
function showViewsOverTime(siteIds, container) {
    console.log("Getting Views over Time: Started!");
    /* Set variables for the "views-per-city" block */
    var date_start = $('#date_start').val();
    var date_end = $('#date_end').val();
    var dateString = date_start + "," + date_end;
    var series = [];
    var categories = [];
    /* Set loading visuals */
    $('#views-over-time-status').css('z-index', '1');
    $('#views-over-time-status').text("Loading Views over Time chart...");
    $('#views-over-time-graphic').fadeTo(1000, '0.5');
    $('#views-over-time-spinner').fadeTo(1000, '1');
    if (viewsOverTimeAjax) {
        viewsOverTimeAjax.abort();
    }
    var methods = [{method: "VisitsSummary.getVisits", params: {period: "day", date: dateString}}];
    viewsOverTimeAjax = $.ajax({
        url: '/application/api/call-data',
        method: 'POST',
        data: {methods: methods, siteIds: siteIds},
        dataType: 'json',
        success: function(resp) {
            /* Store data into the local object cache */

            /* Sets the dimension and date for the views over time chart */

            //var allSeries;
            console.log(resp);
            var series = [];
            var allResults = [];

            var isSingle = false;
            $.each(resp, function(i, respEntry) {
                if (respEntry[1]) {
                    $.each(respEntry, function(i, data) {
                        for (var key in data) {

                            //   console.log(key);
                            if (key in allResults) {
                                allResults[key].value = parseFloat(allResults[key].value) + parseFloat(data[key]);
                            } else {
                                allResults[key] = {key: key, value: parseFloat(data[key])};
                            }
                        }
                    });
                    console.log("Multiple");
                } else {
                    for (var key in respEntry) {

                        //   console.log(key);
                        if (key in allResults) {
                            allResults[key].value = parseFloat(allResults[key].value) + parseFloat(respEntry[key]);
                        } else {
                            allResults[key] = {key: key, value: parseFloat(respEntry[key])};
                        }
                    }
                    console.log("Single");
                }
            });
            $.each(resp[0], function(i, data) {

                if (isNaN(parseFloat(data))) {

                    // console.log(data);
                }
                else {
                    //  console.log(data);
                }
//                for (var key in data) {
//
//                    //   console.log(key);
//                    if (key in allResults) {
//                        allResults[key].value = parseFloat(allResults[key].value) + parseFloat(data[key]);
//                    } else {
//                        allResults[key] = {key: key, value: parseFloat(data[key])};
//                    }
//                }
//                $.each(data, function(i, dateEntry) {
//                    
//                    //  var key = Object.keys(dateEntry);
//                    //   console.log(key);
//                    // if (key in allResults) {
//                    // allResults[key].value = parseFloat(allResults[key].value) + parseFloat(pixel_views);
//                    //  } else {
//                    // allResults[key] = {key: key, city: city, value: pixel_views};
//                    //  }
//                });
            });

            for (var date in allResults)
            {

                var result = allResults[date];
                if (result.key) {
                    /* Retrieve values */
                    var pixel_views = parseFloat(result.value);
                    series.push({y: pixel_views, x: parseInt((+new Date(result.key).getTime() + (60 * 60 * 1000))), name: result.key});
                    categories.push(result.key);
                }




            }




            /* Loop through the received data and create a serie out of
             this data, to use in Highcharts later on */
//                $.each(resp[0]['data'], function(i, data) {
//                    series.push({y: parseFloat(data[measure]), x: parseInt((+new Date(data[dimension]).getTime() + (60 * 60 * 1000))), name: "Date"});
//                    categories.push(data[dimension]);
//                });

            /* Calls the method to actually draw the chart */
            drawVoTChart(series, categories, container);
            return;
        },
        error: function(resp) {
            /* Retry to draw the views over time on error within 15 seconds */
//                setTimeout(function() {
//                    showViewsOverTime(beaconIds);
//                }, 15000);
        },
        complete: function() {
            $('#views-over-time-status').css('z-index', '0');
            $('#views-over-time-graphic').fadeTo(1000, '1');
            console.log("Updating Views over Time: Done!");
        }
    });
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
            viewsOverTimeChart.destroy();
            viewsOverTimeChart = new Highcharts.StockChart(createViewsOverTimeChartOptions('views-over-time-graphic', serieData));
            //viewsOverTimeChart.series[0].setData(serieData, false, true, true);
//            viewsOverTimeChartOptions.chart.events.click = function(event) {
//
//                hs.htmlExpand(document.getElementById(container), {
//                    width: 800,
//                    height: 600,
//                    allowWidthReduction: true,
//                    preserveContent: false
//                }, {
//                    chartOptions: viewsOverTimeChartOptions
//                });
//
//            };
//            createViewsOverTimeChartOptions(container, serieData);
//            viewsOverTimeChart.redraw();
        } else {
            if (!container) {
                container = "views-over-time-graphic";
            }
            /* Create the chart options object */
            var chartOptions = createViewsOverTimeChartOptions(container, serieData);

            /* Create the actual chart */
            chartOptions.chart.events.click = function(event) {
                window.setTimeout(function() {
                    console.log("waiting");
                });
                console.log(container);
                hs.htmlExpand(document.getElementById(container), {
                    width: 800,
                    height: 600,
                    allowWidthReduction: true,
                    preserveContent: false
                }, {
                    chartOptions: chartOptions
                });

            };
            console.log(chartOptions);
            viewsOverTimeChart = new Highcharts.StockChart(chartOptions);
        }

        $('#views-over-time-status').css('z-index', '0');
        $('#views-over-time-graphic').fadeTo(1000, '1');
        $('#views-over-time-spinner').fadeTo(1000, '0');
    } else {
        $('#views-over-time-status').text("No data found. Please specify a different date range.");
    }
}

function createViewsOverTimeChartOptions(container, serieData) {
    var chartOptions = {
        chart: {
            stockChart: true,
            renderTo: container,
            zoomType: 'xy',
            type: 'line',
            events: {
                click: function(event) {
                    //alert("Clicked!");
                    hs.htmlExpand(document.getElementById(container), {
                        width: 800,
                        height: 600,
                        allowWidthReduction: true,
                        preserveContent: false
                    }, {
                        chartOptions: viewsOverTimeChartOptions
                    });
                }
            }

        },
        title: {
            text: '<div>Views over Time</div>'
        },
        subtitle: {
            text: 'Click to enlarge'
        },
        xAxis: {
            type: 'datetime'
        },
        tooltip: {
            shared: false
        },
        plotOptions: {
            series: {
                //  allowPointSelect: false,


            }
        },
        series: [{
                name: "Views",
                data: serieData

            }]
    };
    viewsOverTimeChartOptions = chartOptions;
    return chartOptions;
}