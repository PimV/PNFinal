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

//    $('#date_start').on('input', function() {
//        showViewsOverTime();
//    });
//    $('#date_end').on('input', function() {
//        showViewsOverTime();
//    });

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

function loadCache() {

}

function showViewsOverTime() {
    $('#view_over_time_status').text("Loading Views over Time chart...");
    var date_start = $('#date_start').val();
    var date_end = $('#date_end').val();
    var series = [];
    var categories = [];
    console.log("Generating views over time");
    $('#view_over_time_status').css('z-index', '1');
    $('#views_over_time').fadeTo(1000, '0.5');

    if (vot_cache) {
        if (new Date(date_start).getTime() < vot_cache['date_start'] || new Date(date_end).getTime() > vot_cache['date_end']) {
            delete vot_cache;
            showViewsOverTime();
        } else {
            var dimension = "date";
            var measure = "flx_pixels_sum";
            $.each(vot_cache['data'], function(i, data) {
                if (new Date(data[dimension]).getTime() >= new Date(date_start).getTime() && new Date(data[dimension]).getTime() <= new Date(date_end).getTime()) {
                    series.push({y: parseFloat(data[measure]), name: data[dimension]});
                    categories.push(data[dimension]);
                }

            });

            drawVoTChart(series, categories);
        }

    } else {
        vot_ajax = $.ajax({
            url: '/visualization/advertiser/views-over-time',
            method: 'POST',
            data: {date_start: date_start, date_end: date_end},
            dataType: 'json',
            success: function(resp) {
                output = resp;
                if (resp['response'] && resp['response']['data'] && resp['response']['data'][0] && resp['response']['data'][0]['data']) {
//                    if (resp['response']['data']) {
//                        if (resp['response']['data'][0]) {
//                            if (resp['response']['data'][0]['data']) {
//                                if (resp['response']['data'][0]['data']) {
                    vot_cache = [];
                    vot_cache['data'] = resp['response']['data'][0]['data'];
                    vot_cache['date_start'] = new Date(date_start).getTime();
                    vot_cache['date_end'] = new Date(date_end).getTime();
                    var dimension = "date";
                    var measure = "flx_pixels_sum";
                    $.each(resp['response']['data'][0]['data'], function(i, data) {

                        series.push({y: parseFloat(data[measure]), name: data[dimension]});
                        categories.push(data[dimension]);

                    });

                    drawVoTChart(series, categories);
                    return;
                }
//                            }
//                        }
//                    }
//                }


            },
            error: function(resp) {
                console.log(resp);
            },
            complete: function() {
                $('#view_over_time_status').css('z-index', '0');
                $('#views_over_time').fadeTo(1000, '1');
                console.log("Loading views over time completed.");

            }
        });
    }
}

function drawVoTChart(series, categories) {
    if (series.length > 0) {
        if (vot_chart) {
            vot_chart.destroy();
        }
        vot_chart_options = {
            chart: {
                renderTo: "views_over_time",
                zoomType: 'xy',
                type: 'line'

            },
            title: {
                text: '<div>Views over Time</div>'
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
                    name: "Views",
                    data: series
                }]



        };

        vot_chart = new Highcharts.Chart(vot_chart_options);


    } else {
        $('#view_over_time_status').text("No data found. Please specify a different date range.");
    }
    $('#view_over_time_status').css('z-index', '0');
    $('#views_over_time').fadeTo(1000, '1');
}


function refresh(dimension, measure, container) {
    if (!container) {
        container = "selectableGraphicContainer";
    }
    var interval = setInterval(setLoadingMessage, 500);
    $.ajax({
        url: '/visualization/advertiser/viz-data',
        method: 'POST',
        data: {dimension: dimension, measure: measure},
        dataType: 'json',
        success: function(resp) {
            output = resp;
            if (resp['response']) {
                if (resp['response']['data']) {
                    if (resp['response']['data'][0]) {
                        if (resp['response']['data'][0]['data']) {
                            if (resp['response']['data'][0]['data']) {
                                var series = [];
                                var categories = [];
                                var dimension = resp['params'][0]['dimensions'][0];
                                var measure = resp['params'][0]['measures'][0];
                                  console.log(resp['response']['data'][0]['data'].length);
                                $.each(resp['response']['data'][0]['data'], function(i, data) {
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
            }
            console.log(resp);
            setStatus("An error occurred. Please try again. If this wasn't the first error with this combination, please contact us.", 'red');
        },
        error: function(resp) {
            console.log("ERROR:");
            console.log(resp);
            setStatus("An error occurred. Please try again. If this wasn't the first error with this combination, please contact us.", 'red');
        },
        complete: function() {
            removeInterval(interval);
            $('#output_button').show();

        }
    });

    function removeInterval(interval) {
        clearInterval(interval);
        $('#loading').hide();
    }
}

var options = {chart: {
        renderTo: "container",
        zoomType: 'xy'

    },
    title: {
        text: '<div>' + "configObject.title" + '</div>'
    },
    xAxis: {
        type: 'category',
        labels: {
            rotation: -45
        },
        allowDecimals: true
    },
    yAxis: {
        type: 'linear',
        allowDecimals: true
    }, tooltip: {
        shared: true,
    },
    plotOptions: {
        series: {
            allowPointSelect: true//,
                    //connectNulls: true
        }
    },
    series: [{
        }
    ]

}
;