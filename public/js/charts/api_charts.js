//Dynamic Charts
var initialLoadingSpanValue;
var loadingSpanValue;
var loadingSpan;
var output;

//ViewsOverTime
var vot_chart; //ViewOverTime chart
var vot_chart_options; //ViewOverTime Chart Options
var vot_ajax;
var vot_cache;

$(document).ready(function() {

    $('.overlay').on('click', function() {
        // var selectedChart = $(this).nextUntil("div").find
        var box1 = bootbox.alert('<div style="width: 1100px; height: 700px;" id="enlargedChartContainer"></div>');
        box1.find('.modal-content').css({'width': '1200px', 'margin-left': '-300px'});
        showViewsOverTime($('#beacon').val(), "enlargedChartContainer");
    });
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

    loadingSpanValue = "Initializing visual data";
    $('#draw_graphic').on('click', function() {
        var dimension = $('#dimension').val();
        var measure = $('#measure').val();
        $('#output_button').hide();
        initialLoadingSpanValue = "Initializing visual data [dimension: " + dimension + "] | [measure: " + measure + "]";
        loadingSpanValue = initialLoadingSpanValue;
        refresh(dimension, measure);
    });

    $('#output_button').on('click', function() {
        var modal = bootbox.alert('<textarea style="width: 1100px; height: 700px; " id="output">' + JSON.stringify(output, undefined, 2) + '</textarea>');
        modal.find('.modal-content').css({'width': '1200px', 'margin-left': '-300px'});
    });
    $('#date_end').blur(function() {
        vot_ajax.abort();
        showViewsOverTime();
    });

    $('#date_start').blur(function() {
        vot_ajax.abort();
        showViewsOverTime();
    });


    showViewsOverTime();
});


function setStatus(status, color) {
    $('#dynamic_status').css('color', 'black');
    if (color) {
        $('#dynamic_status').css('color', color);
    }
    $('#selectableGraphicContainer').text("");
    $('#dynamic_status').text(status);
}

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

function showViewsOverTime(beaconIds, container) {

    $('#view_over_time_status').text("Loading Views over Time chart...");
    var date_start = $('#date_start').val();
    var date_end = $('#date_end').val();
    var series = [];
    var categories = [];
    $('#view_over_time_status').css('z-index', '1');
    $('#views-over-time-graphic').fadeTo(1000, '0.5');
    $('#views-over-time-spinner').fadeTo(1000, '1');

    if (vot_cache && !beaconIds) {
        if (new Date(date_start).getTime() < vot_cache['date_start'] || new Date(date_end).getTime() > vot_cache['date_end']) {
            vot_cache = null;
            showViewsOverTime();
        } else {
            var dimension = "date";
            var measure = "flx_pixels_sum";
            $.each(vot_cache['data'], function(i, data) {
                if (new Date(data[dimension]).getTime() >= new Date(date_start).getTime() && new Date(data[dimension]).getTime() <= new Date(date_end).getTime()) {
                    series.push({y: parseFloat(data[measure]), x: parseInt((+new Date(data[dimension]).getTime() + (60 * 60 * 1000))), name: data[dimension]});
                    //series.push({y: parseFloat(data[measure]), name: data[dimension]});
                    categories.push(data[dimension]);
                }
            });

            drawVoTChart(series, categories, container);
        }
    } else {
        if (vot_ajax) {
            vot_ajax.abort();
        }
        vot_ajax = $.ajax({
            url: '/visualization/advertiser/views-over-time',
            method: 'POST',
            data: {date_start: date_start, date_end: date_end, beaconIds: beaconIds},
            dataType: 'json',
            success: function(resp) {

                if (resp && resp[0] && resp[0]['data']) {
                    vot_cache = [];
                    vot_cache['data'] = resp[0]['data'];
                    vot_cache['date_start'] = new Date(date_start).getTime();
                    vot_cache['date_end'] = new Date(date_end).getTime();
                    vot_cache['beacon_ids'] = beaconIds;
                    var dimension = "date";
                    var measure = "flx_pixels_sum";
                    $.each(resp[0]['data'], function(i, data) {
                        series.push({y: parseFloat(data[measure]), x: parseInt((+new Date(data[dimension]).getTime() + (60 * 60 * 1000))), name: data[dimension]});
                        categories.push(data[dimension]);
                    });
                    drawVoTChart(series, categories, container);
                    return;
                } else {
                    return;
                }
            },
            error: function(resp) {
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

function drawVoTChart(series, categories, container) {
    if (series.length > 0) {
        if (vot_chart && !container) {
            vot_chart.series[0].setData(series, false, true, true);
            //vot_chart.xAxis[0].setCategories(categories, false);
            vot_chart.redraw();
        } else {
            if (!container) {
                container = "views-over-time-graphic";
            }
            vot_chart_options = {
                chart: {
                    renderTo: container,
                    zoomType: 'xy',
                    type: 'line'

                },
                title: {
                    text: '<div>Views over Time</div>'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        //rotation: -90,
                        //y: 50
                    },
                    // allowDecimals: true,
                    // categories: categories
                },
//                yAxis: {
//                    type: 'linear',
//                    allowDecimals: true
//                },
                tooltip: {
                    shared: false,
                },
                plotOptions: {
                    series: {
                        allowPointSelect: true
                    },
//                    line: {
//                        "pointInterval": 259200000//,
//                                //"pointStart": 1282408923000
//                    }
                },
                series: [{
                        id: "serie_0",
                        name: "Views",
                        data: series
                    }]
            };
            vot_chart = new Highcharts.StockChart(vot_chart_options);
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

function enlargeChart() {

}
