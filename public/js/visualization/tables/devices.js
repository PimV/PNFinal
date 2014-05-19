var devicesChart;
var devicesInformation;
var devicesChartOptions;

$(document).ready(function() {
    $('#devices-chart-actions').on('click', function() {
        createDevicesActions();
    });
    $('#devices-chart-visits').on('click', function() {
        createDevicesVisits();
    });

    $('#devices-chart-uvisitors').on('click', function() {
        createDevicesUniqueVisitors();
    });
});

function getDevicesTable(siteIds) {
    var methods =
            [
                {
                    method: "UserSettings.getMobileVsDesktop",
                    params: {
                        period: "range",
                        date: "2014-04-01,today"
                    }
                },
                {
                    method: "UserSettings.getOSFamily",
                    params: {
                        period: "range",
                        date: "2014-04-01,today"
                    }
                }
            ];
    $('#devices').fadeTo(1000, '0.5');
    $('#devices-spinner').fadeTo(1000, '1.0');
    $.ajax({
        url: '/application/api/call-data',
        method: 'POST',
        data: {siteIds: siteIds, methods: methods},
        dataType: 'json',
        success: function(resp) {
            var firstResult = resp[0];
            var secondResult = resp[1];

            var singleSite = false;

            devicesInformation = [];
            devicesInformation['Mobile'] = [];
            devicesInformation['Desktop'] = [];
            devicesInformation['Unknown'] = [];
            $.each(firstResult, function(i, data) {
                if (singleSite === true || data['label']) {
                    singleSite = true;
                    devicesInformation[data['label']]['visits'] = parseFloat(data['nb_visits']);
                    devicesInformation[data['label']]['uvisitors'] = parseFloat(data['sum_daily_nb_uniq_visitors']);
                    devicesInformation[data['label']]['actions'] = parseFloat(data['nb_actions']);
                } else {
                    $.each(data, function(i, entry) {
                        if (devicesInformation[entry['label']]['visits']) {
                            devicesInformation[entry['label']]['visits'] = parseFloat(devicesInformation[entry['label']]['visits']) + parseFloat(entry['nb_visits']);
                            devicesInformation[entry['label']]['uvisitors'] = parseFloat(devicesInformation[entry['label']]['uvisitors']) + parseFloat(entry['sum_daily_nb_uniq_visitors']);
                            devicesInformation[entry['label']]['actions'] = parseFloat(devicesInformation[entry['label']]['actions']) + parseFloat(entry['nb_actions']);
                        } else {
                            devicesInformation[entry['label']]['visits'] = parseFloat(entry['nb_visits']);
                            devicesInformation[entry['label']]['uvisitors'] = parseFloat(entry['sum_daily_nb_uniq_visitors']);
                            devicesInformation[entry['label']]['actions'] = parseFloat(entry['nb_actions']);
                        }
                    });

                    console.log("multiple");
                }
            });

            $('#mobile-visits').text(formatNumber(devicesInformation['Mobile']['visits'], 0));
            $('#pc-visits').text(formatNumber(devicesInformation['Desktop']['visits'], 0));
            $('#unknown-visits').text(formatNumber(devicesInformation['Unknown']['visits'], 0));

            $('#mobile-actions').text(formatNumber(devicesInformation['Mobile']['actions'], 0));
            $('#pc-actions').text(formatNumber(devicesInformation['Desktop']['actions'], 0));
            $('#unknown-actions').text(formatNumber(devicesInformation['Unknown']['actions'], 0));

            $('#mobile-uvisitors').text(formatNumber(devicesInformation['Mobile']['uvisitors'], 0));
            $('#pc-uvisitors').text(formatNumber(devicesInformation['Desktop']['uvisitors'], 0));
            $('#unknown-uvisitors').text(formatNumber(devicesInformation['Unknown']['uvisitors'], 0));

            createDevicesVisits(devicesInformation);


            $.each(secondResult, function(i, data) {
                if (singleSite === true) {
                    console.log("Single");
                } else {
                    console.log("Multiple");
                }
            })

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            $('#devices').fadeTo(1000, '1.0');
            $('#devices-spinner').fadeTo(1000, '0');
        }
    });
}
function createDevicesVisits() {

    var chartOptions = {
        chart: {
            stockChart: false,
            renderTo: 'devices-chart',
            events: {
                click: function(event) {
                    hs.htmlExpand(document.getElementById('devices-chart'), {
                        width: 800,
                        height: 600,
                        allowWidthReduction: true,
                        preserveContent: false
                    }, {
                        chartOptions: devicesChartOptions
                    });
                }
            }

        },
        title: {
            text: '<div>Devices (visits)</div>'

        },
        subtitle: {
            text: 'Click to enlarge'
        },
        tooltip: {
            shared: false
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
            }
        },
        series: [{
                type: 'pie',
                name: 'Visits',
                data: [
                    ['Mobile', devicesInformation['Mobile']['visits']],
                    ['Desktop', devicesInformation['Desktop']['visits']],
                    ['Unknown', devicesInformation['Unknown']['visits']]
                ]
            }
        ]
    };
    devicesChartOptions = chartOptions;
    devicesChart = new Highcharts.Chart(devicesChartOptions);
}

function createDevicesUniqueVisitors() {
    var chartOptions = {
        chart: {
            stockChart: false,
            renderTo: 'devices-chart',
            events: {
                click: function(event) {
                    hs.htmlExpand(document.getElementById('devices-chart'), {
                        width: 800,
                        height: 600,
                        allowWidthReduction: true,
                        preserveContent: false
                    }, {
                        chartOptions: devicesChartOptions
                    });
                }
            }

        },
        title: {
            text: '<div>Devices (unique visitors)</div>'

        },
        subtitle: {
            text: 'Click to enlarge'
        },
        tooltip: {
            shared: false
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
            }
        },
        series: [{
                type: 'pie',
                name: 'Unique Visitors',
                data: [
                    ['Mobile', devicesInformation['Mobile']['uvisitors']],
                    ['Desktop', devicesInformation['Desktop']['uvisitors']],
                    ['Unknown', devicesInformation['Unknown']['uvisitors']]
                ]
            }
        ]
    };
    devicesChartOptions = chartOptions;
    devicesChart = new Highcharts.Chart(devicesChartOptions);
}

function createDevicesActions() {
    var chartOptions = {
        chart: {
            stockChart: false,
            renderTo: 'devices-chart',
            events: {
                click: function(event) {
                    hs.htmlExpand(document.getElementById('devices-chart'), {
                        width: 800,
                        height: 600,
                        allowWidthReduction: true,
                        preserveContent: false
                    }, {
                        chartOptions: devicesChartOptions
                    });
                }
            }

        },
        title: {
            text: '<div>Devices (actions)</div>'

        },
        subtitle: {
            text: 'Click to enlarge'
        },
        tooltip: {
            shared: false
        },
        plotOptions: {
            series: {
                allowPointSelect: true,
            }
        },
        series: [{
                type: 'pie',
                name: 'Actions',
                data: [
                    ['Mobile', devicesInformation['Mobile']['actions']],
                    ['Desktop', devicesInformation['Desktop']['actions']],
                    ['Unknown', devicesInformation['Unknown']['actions']]
                ]
            }
        ]
    };
    devicesChartOptions = chartOptions;
    devicesChart = new Highcharts.Chart(devicesChartOptions);
}