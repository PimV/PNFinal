var initialLoadingSpanValue;
var loadingSpanValue;
var loadingSpan;
$(document).ready(function() {

    loadingSpanValue = "Initializing visual data";
    $('#draw_graphic').on('click', function() {
        var dimension = $('#dimension').val();
        var measure = $('#measure').val();
        initialLoadingSpanValue = "Initializing visual data [dimension: " + dimension + "] | [measure: " + measure + "]";
        loadingSpanValue = initialLoadingSpanValue;
        refresh(dimension, measure);
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

function refresh(dimension, measure) {
    var interval = setInterval(setLoadingMessage, 500);
    $.ajax({
        url: '/visualization/advertiser/viz-data',
        method: 'POST',
        data: {dimension: dimension, measure: measure},
        dataType: 'json',
        success: function(resp) {
            if (resp['response']) {
                if (resp['response']['data']) {
                    if (resp['response']['data'][0]) {
                        if (resp['response']['data'][0]['data']) {
                            if (resp['response']['data'][0]['data']) {
                                var series = [];
                                var categories = [];
                                var dimension = resp['params'][0]['dimensions'][0];
                                var measure = resp['params'][0]['measures'][0];
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
                                            renderTo: "selectableGraphicContainer",
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

};