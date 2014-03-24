//CELLS THAT CAN BE SKIPPED WHILE PROCESSING THE VALUES
//These cells are only for layout purposes.

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}




function setStaticCells() {
    var STATIC_CELLS = [
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7],
        [7, 7]
    ];
    return STATIC_CELLS;
}



function start(google_key, containerId) {
    getWorksheetInfo(google_key, containerId);
}

function getWorksheetInfo(google_key, containerId) {
    var url = 'https://spreadsheets.google.com/feeds/worksheets/' + google_key + '/public/basic?alt=json';
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        success: function(resp) {
            sheetCount = resp['feed']['openSearch$totalResults']['$t'];
            for (var i = 1; i <= sheetCount; i++) {
                if (!resp['feed']['entry'][i - 1]['title']['$t'].startsWith("_")) {
                    getCellsPerSheet(google_key, containerId, i);
                }
            }

        },
        error: function(resp) {
            console.log("Error in spreadSheetInfo: " + resp);
        }
    });
}

function getCellsPerSheet(google_key, containerId, sheetCount) {
    var url = 'https://spreadsheets.google.com/feeds/cells/' + google_key + '/' + sheetCount + '/public/values?alt=json';
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        success: function(resp) {
            convertRawData(google_key, containerId, sheetCount, resp);
        },
        error: function(resp) {
            console.log("Error in spreadSheetInfo: " + resp);
        }
    });
}

function convertRawData(google_key, containerId, sheetCount, json) {
    rawData = json['feed']['entry'];
    procData = [];
    $.each(rawData, function(i, entry) {
        var column = entry['gs$cell']['col'];
        var row = entry['gs$cell']['row'];
        var value = entry['gs$cell']['$t'];
        procData[[row, column]] = value;
    });
    var sheetTitle = json['feed']['title']['$t'];
    processData(google_key, containerId, sheetCount, procData, sheetTitle);
}

function processData(google_key, containerId, sheetCount, procData, sheetTitle) {
    var configObject = generateConfigObject(procData, sheetTitle);

    var series = new Array();
    for (var column = 2; column <= 6; column++) {

//Check if column has name, if not, stop.
        if (procData[[1, column]]) {
            var newSerie = createSerie(procData, column, config.rows);
            if (newSerie !== 'null') {
                series.unshift(newSerie);
                if (config.solo === true) {
                    break;
                }
            }
        }
    }
    createChartOptions(containerId, configObject, series);
}

function createChartOptions(containerId, configObject, series) {
    var options = {
        chart: {
            renderTo: containerId,
            zoomType: 'xy'
        },
        title: {
            text: '<div>' + configObject.title + '</div>'
        },
        xAxis: {
            type: configObject.xScale,
            labels: {
                rotation: -45
            },
            allowDecimals: true
        },
        yAxis: {
            type: configObject.yScale,
            allowDecimals: true
        },
        tooltip: {
            shared: false,
//            formatter: function() {
//                return '<b>' + this.point.name + '</b>: ' + this.point.y.toFixed(2);
//            }
        },
        plotOptions: {
            series: {
                allowPointSelect: true//,
                        //connectNulls: true
            }
        }
    };
    createChart(options, configObject, series);

}

function createSerie(procData, column, rows) {
    var serieName = procData[[1, column]];
    var serieType;
    switch (column) {
        case 2:
            serieType = config.columnOne;
            break;
        case 3:
            serieType = config.columnTwo;
            break;
        case 4:
            serieType = config.columnThree;
            break;
        case 5:
            serieType = config.columnFour;
            break;
        case 6:
            serieType = config.columnFive;
            break;
    }


    var xValues = [];
    for (var row = 2; row <= rows + 1; row++) {
        var value = procData[[row, 1]];
        xValues[row] = parseXValue(value);
    }

    var yValues = [];
    for (var row = 2; row <= rows + 1; row++) {
        var value = procData[[row, column]];
        yValues[row] = parseYValue(value);
    }
    var points = [];
    points.splice(0, 1);
    for (var i = 2; i <= rows + 1; i++) {
        point = createPoint(config, xValues[i], yValues[i], serieType);
        points.push(point);
    }

    return createSerieObject(serieName, points, serieType, config);
}

function fillConfigCells() {
    var CONFIG_CELLS = [];
    CONFIG_CELLS[[2, 8]] = 'Google Spreadsheet'; //Worksheet title
    CONFIG_CELLS[[3, 8]] = 'category'; //xScale
    CONFIG_CELLS[[4, 8]] = 'linear'; //yScale
    CONFIG_CELLS[[5, 8]] = 'no'; //Highstock
    CONFIG_CELLS[[6, 8]] = 'line'; //Column 1
    CONFIG_CELLS[[7, 8]] = 'line'; //Column 2
    CONFIG_CELLS[[8, 8]] = 'line'; //Column 3
    CONFIG_CELLS[[9, 8]] = 'line'; //Column 4
    CONFIG_CELLS[[10, 8]] = 'line'; //Column 5
    CONFIG_CELLS[[11, 8]] = -1;
    return CONFIG_CELLS;
}

function createConfig() {
    config = new Object();
    config.title = 'undefined';
    config.xScale = 'category';
    config.yScale = 'linear';
    config.highStock = 'no';
    config.columnOne = 'line';
    config.columnTwo = 'line';
    config.columnThree = 'line';
    config.columnFour = 'line';
    config.columnFive = 'line';
    config.rows = -1;
    config.solo = false;
    return config;
}

function generateConfigObject(procData, sheetTitle) {
    var configCells = fillConfigCells();
    var config = createConfig();
    var configKeys = Object.keys(configCells);
    $.each(configKeys, function(i, key) {
        switch (i) {
            case 0:
                if (procData[key]) {
                    config.title = procData[key];
                } else {
                    config.title = sheetTitle;
                }
                break;
            case 1:
                if (procData[key]) {
                    config.xScale = procData[key];
                }
                break;
            case 2:
                if (procData[key]) {
                    config.yScale = procData[key];
                }
                break;
            case 3:
                if (procData[key]) {
                    config.highStock = procData[key];
                }
                break;
            case 4:
                if (procData[key]) {
                    if (procData[key].endsWith('*')) {
                        config.solo = true;
                    }
                    config.columnOne = procData[key];
                }
                break;
            case 5:
                if (procData[key]) {
                    config.columnTwo = procData[key];
                }
                break;
            case 6:
                if (procData[key]) {
                    config.columnThree = procData[key];
                }
                break;
            case 7:
                if (procData[key]) {
                    config.columnFour = procData[key];
                }
                break;
            case 8:
                if (procData[key]) {
                    config.columnFive = procData[key];
                }
                break;
            case 9:
                if (procData[key]) {
                    config.rows = parseInt(procData[key]);
                }
                break;
        }
    });
    return config;
}

function dateParser(dateString) {
    var split = dateString.split('/');
    var day = split[0];
    var month = split[1] - 1;
    var year = split[2];
    var timestamp = parseInt((+new Date(year, month, day).getTime() + (60 * 60 * 1000)));
    return timestamp;
}

function parseXValue(xValue) {
    switch (config.xScale) {
        case 'datetime':
            xValue = parseFloat(dateParser(xValue));
            break;
        default:
            break;
    }
    return xValue;
}

function parseYValue(yValue) {
    return parseFloat(yValue);
}

function createPoint(config, xValue, yValue, serieType) {
    point = new Object();
    point.y = parseFloat(yValue);
    point.name = xValue;
    if (config.xScale === 'datetime' || serieType.startsWith('pie')) {

        point.x = xValue;
    }
    return point;
}

function createSerieObject(serieName, data, serieType, config) {
    var serie = new Object();
    serie.name = serieName;
    serie.data = data;
    switch (serieType) {
        case 'pie':
            serie.type = serieType;
            serie.size = 150;
            serie.dataLabels = false;
            serie.center = [150, 55];
            break;
        case "Do not draw":
            return 'null';
        default:
            serie.type = serieType;
            break;
    }

    return serie;
}

function createChart(options, config, series) {
    var chart;
    if (config.xScale !== 'datetime') {
        options.tooltip.formatter = function() {
            return '<b>' + this.point.name + '</b>: ' + this.point.y.toFixed(2);
        };
    }
    if (config.highStock === 'no') {

        chart = new Highcharts.Chart(options);
    } else {
        chart = new Highcharts.StockChart(options);
    }

    config.solo = series.length < 2;
    $.each(series, function(i, serie) {
        if (config.solo === true) {
            serie.size = "60%";
            serie.dataLabels = {enabled: true, align: 'left', crop: false};
            serie.center = [null, null];
            serie.showInLegend = true;
        }
        chart.addSeries(serie);
    });
}