var global_process_id = 0;
var currentSheet = [];
var maxSheets = [];
var blankSheets = [];
var sheetIds = [];

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
    $('#spinner').show();
    global_process_id++;

    getWorksheetInfo(google_key, containerId, global_process_id);

}

function getWorksheetInfo(google_key, containerId, processId) {
    console.log("Process ID: " + processId);
    var url = 'https://spreadsheets.google.com/feeds/worksheets/' + google_key + '/public/basic?alt=json';
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        success: function(resp) {
            sheetCount = resp['feed']['openSearch$totalResults']['$t'];
            currentSheet[processId] = -1;
            maxSheets[processId] = 0;
            blankSheets[processId] = 0;
            sheetIds[processId] = [];
            for (var i = 1; i <= sheetCount; i++) {
                if (!resp['feed']['entry'][i - 1]['title']['$t'].startsWith("_")) {

                    maxSheets[processId] = maxSheets[processId] + 1;
                    sheetIds[processId].push(i);
                    getCellsPerSheet(google_key, containerId, i, processId);
                } else {
                    blankSheets[processId] = blankSheets[processId] + 1;
                }
            }
        },
        error: function(resp) {
            console.log("Error in spreadSheetInfo: " + resp);
        }
    });
}

function getCellsPerSheet(google_key, containerId, sheetCount, processId) {

    var url = 'https://spreadsheets.google.com/feeds/cells/' + google_key + '/' + sheetCount + '/public/values?alt=json';
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        success: function(resp) {
            convertRawData(google_key, containerId, sheetCount, resp, processId);
        },
        error: function(resp) {
            console.log("Error in spreadSheetInfo: " + resp);
        }
    });
}

function convertRawData(google_key, containerId, sheetCount, json, processId) {

    rawData = json['feed']['entry'];
    procData = [];
    $.each(rawData, function(i, entry) {
        var column = entry['gs$cell']['col'];
        var row = entry['gs$cell']['row'];
        var value = entry['gs$cell']['$t'];
        procData[[row, column]] = value;
    });
    var sheetTitle = json['feed']['title']['$t'];
    processData(google_key, containerId, sheetCount, procData, sheetTitle, processId);
}

function processData(google_key, containerId, sheetCount, procData, sheetTitle, processId) {
    var configObject = generateConfigObject(procData, sheetTitle, sheetCount);

    var series = new Array();
    for (var column = 2; column <= 7; column++) {
        if (procData[[1, column]]) {
            var newSerie = createSerie(procData, column, config.rows);
            if (newSerie !== 'null') {
                series.push(newSerie);
                if (config.solo === true) {
                    break;
                }
            }
        }
    }
    createChartOptions(containerId, configObject, series, sheetCount, processId);
}

function createChartOptions(containerId, configObject, series, sheetCount, processId) {

    containerId = checkContainer(containerId, configObject, sheetCount, processId);

    setContainerSize(containerId, config.size);


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
            shared: false
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
    var serieColor;
    switch (column) {
        case 2:
            serieColor = config.color1;
            serieType = config.columnOne;
            break;
        case 3:
            serieColor = config.color2;
            serieType = config.columnTwo;
            break;
        case 4:
            serieColor = config.color3;
            serieType = config.columnThree;
            break;
        case 5:
            serieColor = config.color4;
            serieType = config.columnFour;
            break;
        case 6:
            serieColor = config.color5;
            serieType = config.columnFive;
            break;
        case 7:
            serieType = 'flags';
    }

    var xValues = [];
    for (var row = 2; row <= rows + 1; row++) {
        var value = procData[[row, 1]];

        xValues[row] = parseXValue(value);
    }

    var yValues = [];
    for (var row = 2; row <= rows + 1; row++) {
        var value = procData[[row, column]];
        if (serieType === 'flags') {
            yValues[row] = value;
        } else {
            yValues[row] = parseYValue(value);
        }

    }
    var points = [];
    points.splice(0, 1);
    for (var i = 2; i <= rows + 1; i++) {
        if (serieType !== 'flags') {
            point = createPoint(config, xValues[i], yValues[i], serieType);
            points.push(point);
        } else {
            if (typeof yValues[i] !== 'undefined') {
                point = createFlag(config, xValues[i], yValues[i], serieType, i, points.length + 1);
                points.push(point);
            }

        }

        //points.push(point);
    }
    return createSerieObject(serieName, points, serieType, serieColor, config);
}

function fillConfigCells() {
    var CONFIG_CELLS = [];
    CONFIG_CELLS[[2, 9]] = 'Google Spreadsheet'; //Worksheet title
    CONFIG_CELLS[[3, 9]] = 'category'; //xScale
    CONFIG_CELLS[[4, 9]] = 'linear'; //yScale
    CONFIG_CELLS[[5, 9]] = 'no'; //Highstock
    CONFIG_CELLS[[6, 9]] = 'line'; //Column 1
    CONFIG_CELLS[[7, 9]] = 'line'; //Column 2
    CONFIG_CELLS[[8, 9]] = 'line'; //Column 3
    CONFIG_CELLS[[9, 9]] = 'line'; //Column 4
    CONFIG_CELLS[[10, 9]] = 'line'; //Column 5
    CONFIG_CELLS[[11, 9]] = -1;
    CONFIG_CELLS[[12, 9]] = 'normal';
    CONFIG_CELLS[[13, 9]] = null;
    CONFIG_CELLS[[14, 9]] = null;
    CONFIG_CELLS[[15, 9]] = null;
    CONFIG_CELLS[[16, 9]] = null;
    CONFIG_CELLS[[17, 9]] = null;
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
    config.size = 'normal';
    config.color1 = null;
    config.color2 = null;
    config.color3 = null;
    config.color4 = null;
    config.color5 = null;
    return config;
}

function generateConfigObject(procData, sheetTitle, sheetCount) {
    var configCells = fillConfigCells();
    var config = createConfig();
    var configKeys = Object.keys(configCells);
    config.sheet = sheetCount;
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
            case 10:
                if (procData[key]) {
                    config.size = procData[key];
                }
                break;
            case 11:
                if (procData[key]) {
                    config.color1 = procData[key];
                }
                break;
            case 12:
                if (procData[key]) {
                    config.color2 = procData[key];
                }
                break;
            case 13:
                if (procData[key]) {
                    config.color3 = procData[key];
                }
                break;
            case 14:
                if (procData[key]) {
                    config.color4 = procData[key];
                }
                break;
            case 15:
                if (procData[key]) {
                    config.color5 = procData[key];
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

function createFlag(config, xValue, yValue, serieType, i, index) {
    point = new Object();
    point.x = i - 2;
    point.text = yValue;
    point.shape = "squarepin";
    point.title = index;
    return point;
}

function createSerieObject(serieName, data, serieType, serieColor, config) {
    var serie = new Object();
    serie.name = serieName;
    serie.data = data;
    serie.color = serieColor;
    switch (serieType) {
        case 'pie':
            serie.type = serieType;
            serie.size = 150;
            serie.dataLabels = false;
            serie.center = [150, 55];
            break;
        case "Do not draw":
            return 'null';
        case 'flags':
            serie.type = serieType;
            serie.showInLegend = false;
            break;
        default:
            serie.type = serieType;
            break;
    }

    return serie;
}

function createChart(options, config, series) {
    var chart;
    if (config.xScale !== 'datetime') {
        options = setTooltip(options);
    }
    if (config.highStock === 'no') {

        chart = new Highcharts.Chart(options);
    } else {
        chart = new Highcharts.StockChart(options);
    }

    config.solo = series.length < 2;
    $.each(series, function(i, serie) {
        if (serie.type === 'flags') {
            serie = addHighestFlags(serie, chart);
        } else {
            if (config.solo === true) {
                serie.size = "60%";
                serie.dataLabels = {enabled: true, align: 'left', crop: false};
                serie.center = [null, null];
                serie.showInLegend = true;
            }

        }
        chart.addSeries(serie);
    });
    //$('#spinner').hide();
}

function checkContainer(renderContainer, config, sheetCount, processId) {
    var mainContainer = renderContainer;

    if ($("#" + renderContainer).length !== 0) {
        if ($("#" + renderContainer).text().length > 0) {
            renderContainer = renderContainer + "_" + sheetCount;
        }
    }
    renderContainer = "sub_" + renderContainer;
    appendDiv(mainContainer, renderContainer, sheetCount, config, processId);
    return renderContainer;
}

function appendDiv(mainContainer, subContainer, sheetCount, config, processId) {
    positionClass = "left chartMargin";
    $.each(sheetIds[processId], function(i, id) {
        if (sheetCount === id) {
            while (id > 0) {
                id = id - 1;
                if (id === 0) {
                    $("#" + mainContainer).prepend('<div style="width: 510px; height: 400px;" id="' + subContainer + '" class="chartContainer ' + positionClass + '"></div>');
                    return;
                } else {
                    var div = $('#sub_' + mainContainer + '_' + id);
                    var exists = div.length > 0;
                    if (exists) {
                        $('<div style="width: 510px; height: 400px;" id="' + subContainer + '" class="chartContainer ' + positionClass + '"></div>').insertAfter(div);
                        return;
                    }
                }
            }
            return;
        }
    });
    currentSheet[processId] = sheetCount;
    if ((currentSheet[processId] - blankSheets[processId]) == maxSheets[processId]) {
        $('#spinner').hide();
    }
}

function setContainerSize(containerId, size) {
    var container = $("#" + containerId);
    switch (size) {
        case 'normal':
            container.css('width', 510);
            container.css('height', 500);
            break;
        case 'large':
            container.css('width', 1080);
            container.css('height', 500);
            break;
    }
}

function setTooltip(options) {
    options.tooltip.formatter = function() {
        if (this.point.text) {
            return '<b>' + this.point.title + '</b>: ' + this.point.text;
        } else if (!isNaN(this.point.y)) {
            return '<b>' + this.point.name + '</b>: ' + this.point.y.toFixed(2);
        }
    };
    return options;
}

function addHighestFlags(flagSerie, chart) {
    if (flagSerie !== null) {
        $.each(flagSerie.data, function(i, resp) {
            var maxPoint = 0;
            $.each(chart.series, function(i2, resp) {
                if (chart.series[i2].data[flagSerie.data[i].x].y > maxPoint) {
                    maxPoint = chart.series[i2].data[flagSerie.data[i].x].y;
                }
            });
            flagSerie.data[i].y = maxPoint;
        });


    }
    return flagSerie;
}

