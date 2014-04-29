/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

/* Counter to keep track of which process is currently being executed.
 Used to sort out the charts. */
var global_process_id = 0;

/* Array with key (processID) and value (currentSheet) */
var currentSheet = [];

/* Array with key (processID) and value (maximum amount of sheets) */
var maxSheets = [];

/* Array with key (processID) and value (amount of blank sheets) */
var blankSheets = [];

/* Array with key (processID) and value (IDs sheets to process) */
var sheetIds = [];

/* Adds the startsWith function to a String */
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
    };
}

/* Adds the endsWith function to a String */
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}


/**
 * Define and return the static cells, which should not be read.
 * 
 * @returns {Array} STATIC_CELLS
 */
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

/**
 * Starts the process to retrieve, create and draw charts from Google
 * Spreadsheets by giving a unique google_key. 
 * 
 * containerId equals to the main container for a single spreadsheet.
 * 
 * @param String google_key
 * @param String containerId
 */
function start(google_key, containerId) {
    $('#spinner').show();

    global_process_id++; //Increment global_process_id to track the request.

    /* Starts the first method (link) in the AJAX-chain. */
    getWorksheetInfo(google_key, containerId, global_process_id);

}

/**
 * The first link in the AJAX-chain. Retrieves the info from all the worksheets.
 * Fills the global arrays with a process ID, max sheets, sheets to read and 
 * blank sheets. 
 * 
 * Each sheet that has to be read, will be sent to the second link in the chain:
 * "getCellsPerSheet()".
 * 
 * @param String google_key
 * @param String containerId
 * @param Integer processId
 */
function getWorksheetInfo(google_key, containerId, processId) {
    var url = 'https://spreadsheets.google.com/feeds/worksheets/' + google_key + '/public/basic?alt=json';
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        success: function(resp) {
            /* Retrieve the amount of sheets this spreadsheet has */
            sheetCount = resp['feed']['openSearch$totalResults']['$t'];

            /* Set defaults for the global arrays */
            currentSheet[processId] = -1;
            maxSheets[processId] = 0;
            blankSheets[processId] = 0;
            sheetIds[processId] = [];

            /* Start the forloop to loop through the retrieved data  */
            for (var i = 1; i <= sheetCount; i++) {
                /* If sheet does not start with "_", sheet has to be read.
                 Ignore sheets starting with "_" */
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

/**
 * Second link in the Chain (of Command (evil) ). Retrieves the data of each cell
 * and sends it to the "convertRawData()" method to be parsed.
 * 
 * @param String google_key
 * @param String containerId
 * @param Integer sheetCount
 * @param Integer processId
 */
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

/**
 * Maps the Google Spreadsheet to a JavaScript array (procData). If completed,
 * sends the procData array to be processed in the "processData()" method.
 * 
 * @param String google_key
 * @param String containerId
 * @param Integer sheetCount
 * @param JSON-String json
 * @param Integer processId
 */
function convertRawData(google_key, containerId, sheetCount, json, processId) {
    var rawData = json['feed']['entry'];
    var procData = [];
    $.each(rawData, function(i, entry) {
        var column = entry['gs$cell']['col'];
        var row = entry['gs$cell']['row'];
        var value = entry['gs$cell']['$t'];
        procData[[row, column]] = value;
    });
    var sheetTitle = json['feed']['title']['$t'];
    processData(google_key, containerId, sheetCount, procData, sheetTitle, processId);
}

/**
 * Processes the procData array to be useful in the application. 
 * Config object will be generated.
 * Serie object will be generated.
 * 
 * Initialize "createChartOptions()" so that the chart can be made.
 * 
 * @param String google_key
 * @param String containerId
 * @param Integer sheetCount
 * @param Array procData
 * @param String sheetTitle
 * @param Integer processId
 */
function processData(google_key, containerId, sheetCount, procData, sheetTitle, processId) {
    var configObject = generateConfigObject(procData, sheetTitle, sheetCount);
    var series = new Array();
    for (var column = 2; column <= 7; column++) {
        if (procData[[1, column]]) {
            var newSerie = createSerie(procData, column, configObject.rows, configObject);
            if (newSerie !== 'null') {
                series.push(newSerie);
                if (configObject.solo === true) {
                    break;
                }
            }
        }
    }
    createChartOptions(containerId, configObject, series, sheetCount, processId);
}

/**
 * Creates the chart options given the parameters below.
 * 
 * @param String containerId
 * @param configObject configObject
 * @param serieObject series
 * @param Integer sheetCount
 * @param Integer processId
 */
function createChartOptions(containerId, configObject, series, sheetCount, processId) {
    /* Creates the containerId and checks if it's valid. */
    containerId = checkContainer(containerId, configObject, sheetCount, processId);

    /* Set the container size for the defined container */
    setContainerSize(containerId, configObject.size);

    /* Set the rotation in the configObject */
    var rotation = 0;
    if (configObject.angledLabels === 'yes') {
        rotation = -45;
    }

    /* Set whether the series should be shared in the configObject */
    var shared = false;
    if (configObject.sharedLegend === 'yes') {
        shared = true;
    }

    /* Create the chart options */
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
                rotation: rotation
            },
            allowDecimals: true
        },
        yAxis: {
            type: configObject.yScale,
            allowDecimals: true
        },
        tooltip: {
            shared: shared
        },
        plotOptions: {
            series: {
                allowPointSelect: true
            }
        }
    };

    /* Create the chart */
    createChart(options, configObject, series);
}

/**
 * Creates a serie object out of the retrieved data.
 * 
 * @param Array procData
 * @param Integer column
 * @param Array rows
 * @returns serieObject
 */
function createSerie(procData, column, rows, configObject) {
    var serieName = procData[[1, column]];
    var serieType;
    var serieColor;
    switch (column) {
        case 2:
            serieColor = configObject.color1;
            serieType = configObject.columnOne;
            break;
        case 3:
            serieColor = configObject.color2;
            serieType = configObject.columnTwo;
            break;
        case 4:
            serieColor = configObject.color3;
            serieType = configObject.columnThree;
            break;
        case 5:
            serieColor = configObject.color4;
            serieType = configObject.columnFour;
            break;
        case 6:
            serieColor = configObject.color5;
            serieType = configObject.columnFive;
            break;
        case 7:
            serieType = 'flags';
    }

    var xValues = [];
    for (var row = 2; row <= rows + 1; row++) {
        var value = procData[[row, 1]];

        xValues[row] = parseXValue(value, configObject);
    }

    var yValues = [];
    for (var row = 2; row <= rows + 1; row++) {
        var value = procData[[row, column]];
        if (serieType === 'flags') {
            yValues[row] = value;
        } else {
            yValues[row] = parseYValue(value, configObject);
        }

    }
    var points = [];
    points.splice(0, 1);
    for (var i = 2; i <= rows + 1; i++) {
        if (serieType !== 'flags') {
            point = createPoint(configObject, xValues[i], yValues[i], serieType);
            points.push(point);
        } else {
            if (typeof yValues[i] !== 'undefined') {
                point = createFlag(configObject, xValues[i], yValues[i], serieType, i, points.length + 1);
                points.push(point);
            }

        }

    }
    return createSerieObject(serieName, points, serieType, serieColor, configObject);
}

/**
 * Returns the pre-defined configObject cells for mapping purposes.
 * 
 * @returns Array CONFIG_CELLS
 */
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
    CONFIG_CELLS[[18, 9]] = 'no';
    CONFIG_CELLS[[19, 9]] = 'no';
    CONFIG_CELLS[[20, 9]] = 'no';
    return CONFIG_CELLS;
}

/**
 * Creates and returns the configObject with defaults.
 * 
 * @returns configObject configObject
 */
function createConfig() {
    var configObject = new Object();
    configObject.title = 'undefined';
    configObject.xScale = 'category';
    configObject.yScale = 'linear';
    configObject.highStock = 'no';
    configObject.columnOne = 'line';
    configObject.columnTwo = 'line';
    configObject.columnThree = 'line';
    configObject.columnFour = 'line';
    configObject.columnFive = 'line';
    configObject.rows = -1;
    configObject.solo = false;
    configObject.size = 'normal';
    configObject.color1 = null;
    configObject.color2 = null;
    configObject.color3 = null;
    configObject.color4 = null;
    configObject.color5 = null;
    configObject.stacking = 'no';
    configObject.angledLabels = 'no';
    configObject.sharedLegend = 'no';
    return configObject;
}

/**
 * Alters the defaults of the configObject created within the "createConfig()"
 * method.
 * 
 * @param Array procData
 * @param String sheetTitle
 * @param Integer sheetCount
 * @returns configObject configObject
 */
function generateConfigObject(procData, sheetTitle, sheetCount) {
    var configCells = fillConfigCells();
    var configObject = createConfig();
    var configKeys = Object.keys(configCells);
    configObject.sheet = sheetCount;
    $.each(configKeys, function(i, key) {
        switch (i) {
            case 0:
                if (procData[key]) {
                    configObject.title = procData[key];
                } else {
                    configObject.title = sheetTitle;
                }
                break;
            case 1:
                if (procData[key]) {
                    configObject.xScale = procData[key];
                }
                break;
            case 2:
                if (procData[key]) {
                    configObject.yScale = procData[key];
                }
                break;
            case 3:
                if (procData[key]) {
                    configObject.highStock = procData[key];
                }
                break;
            case 4:
                if (procData[key]) {
                    if (procData[key].endsWith('*')) {
                        configObject.solo = true;
                    }
                    configObject.columnOne = procData[key];
                }
                break;
            case 5:
                if (procData[key]) {
                    configObject.columnTwo = procData[key];
                }
                break;
            case 6:
                if (procData[key]) {
                    configObject.columnThree = procData[key];
                }
                break;
            case 7:
                if (procData[key]) {
                    configObject.columnFour = procData[key];
                }
                break;
            case 8:
                if (procData[key]) {
                    configObject.columnFive = procData[key];
                }
                break;
            case 9:
                if (procData[key]) {
                    configObject.rows = parseInt(procData[key]);
                }
                break;
            case 10:
                if (procData[key]) {
                    configObject.size = procData[key];
                }
                break;
            case 11:
                if (procData[key]) {
                    configObject.color1 = procData[key];
                }
                break;
            case 12:
                if (procData[key]) {
                    configObject.color2 = procData[key];
                }
                break;
            case 13:
                if (procData[key]) {
                    configObject.color3 = procData[key];
                }
                break;
            case 14:
                if (procData[key]) {
                    configObject.color4 = procData[key];
                }
                break;
            case 15:
                if (procData[key]) {
                    configObject.color5 = procData[key];
                }
                break;
            case 16:
                if (procData[key]) {
                    configObject.stacking = procData[key];
                }
                break;
            case 17:
                if (procData[key]) {
                    configObject.angledLabels = procData[key];
                }
                break;
            case 18:
                if (procData[key]) {
                    configObject.sharedLegend = procData[key];
                }
                break;
        }
    });
    return configObject;
}

/**
 * Converts a dateString to a UNIX Timestamp
 * 
 * @param String dateString
 * @returns Integer timeStamp
 */
function dateParser(dateString) {
    var split = dateString.split('/');
    var day = split[0];
    var month = split[1] - 1;
    var year = split[2];
    var timestamp = parseInt((+new Date(year, month, day).getTime() + (60 * 60 * 1000)));
    return timestamp;
}

/**
 * Parses the xValue if needed (compatibility with datetime and such).
 * 
 * @param mixed xValue
 * @returns mixed xValue (parsed)
 */
function parseXValue(xValue, configObject) {
    switch (configObject.xScale) {
        case 'datetime':
            xValue = parseFloat(dateParser(xValue));
            break;
        default:
            break;
    }
    return xValue;
}

/**
 * Parses the yValue if needed (for later use, perhaps).
 * 
 * @param mixed yValue
 * @returns mixed yValue (parsed)
 */
function parseYValue(yValue, configObject) {
    return parseFloat(yValue);
}

/**
 * Creates a point out of a given xValue and yValue according to the configObject
 * optins and serieTypes. Point is later used in the creation of the series.
 * 
 * @param configObject configObject
 * @param mixed xValue
 * @param mixed yValue
 * @param String serieType
 * @returns pointObject point
 */
function createPoint(configObject, xValue, yValue, serieType) {
    point = new Object();
    point.y = parseFloat(yValue);
    point.name = xValue;
    if (configObject.xScale === 'datetime' || serieType.startsWith('pie')) {

        point.x = xValue;
    }
    return point;
}

/**
 * Creates a flag out of a given yValue, i (x-coordinate) and index(flag-content).
 * 
 * @param configObject configObject
 * @param mixed xValue
 * @param mixed yValue
 * @param String serieType
 * @param Integer i
 * @param String index
 * @returns pointObject point
 */
function createFlag(configObject, xValue, yValue, serieType, i, index) {
    point = new Object();
    point.x = i - 2;
    point.text = yValue;
    point.shape = "squarepin";
    point.title = index;
    return point;
}

/**
 * Creates a serie Object out of the given parameters
 * 
 * @param String serieName
 * @param Array data
 * @param String serieType
 * @param String serieColor
 * @param configObject configObject
 * @returns serieObject serie
 */
function createSerieObject(serieName, data, serieType, serieColor, configObject) {
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

/**
 * Creates a Highchart. Once the chart/stockchart is created, 
 * series and flags will be added.
 * 
 * @param chartOptionsObject options
 * @param configObject configObject
 * @param Array(SerieObjects) series
 */
function createChart(options, configObject, series) {
    var chart;
    if (configObject.xScale !== 'datetime') {
        options = setTooltip(options);
    }
    if (configObject.highStock === 'no') {

        chart = new Highcharts.Chart(options);
    } else {
        chart = new Highcharts.StockChart(options);
    }

    if (configObject.stacking === 'yes') {
        console.log("Enabling stacks");
        chart = enableStacking(chart);
    }

    configObject.solo = series.length < 2;
    $.each(series, function(i, serie) {
        if (serie.type === 'flags') {
            serie = addHighestFlags(serie, chart);
        } else {
            if (configObject.solo === true) {
                serie.size = "60%";
                serie.dataLabels = {enabled: true, align: 'left', crop: false};
                serie.center = [null, null];
                serie.showInLegend = true;
            }

        }
        chart.addSeries(serie);
    });
}

/**
 * Creates a unique containerId
 * 
 * @param String renderContainer
 * @param configObject configObject
 * @param Integer sheetCount
 * @param Integer processId
 * @returns String containerId
 */
function checkContainer(renderContainer, configObject, sheetCount, processId) {
    var mainContainer = renderContainer;
    renderContainer = renderContainer + "_" + sheetCount;
    renderContainer = "sub_" + renderContainer;
    appendDiv(mainContainer, renderContainer, sheetCount, configObject, processId);
    return renderContainer;
}

/**
 * Uses an algorithm to determine where to add a newly created div.
 * 
 * @param String mainContainer
 * @param String subContainer
 * @param Integer sheetCount
 * @param configObject configObject
 * @param Integer processId
 */
function appendDiv(mainContainer, subContainer, sheetCount, configObject, processId) {
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

/**
 * Sets the container size by 'standards' (normal/large)
 * 
 * @param String containerId
 * @param String size
 */
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

/**
 * Set the tooltip formatter.
 * 
 * @param chartOptionsObject options
 * @returns chartOptionsObject options (changed);
 */
function setTooltip(options) {
    if (options.tooltip.shared === false) {
        options.tooltip.formatter = function() {
            if (this.point.text) {
                return '<b>' + this.point.title + '</b>: ' + this.point.text;
            } else if (!isNaN(this.point.y)) {
                return '<b>' + this.point.name + '</b>: ' + this.point.y.toFixed(2);
            }
        };
    }
    return options;
}

/**
 * Adds the flags to the highest line on the chart.
 * 
 * @param serieObject flagSerie
 * @param chartObject chart
 * @returns serieObject flagSerie (changed)
 */
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

/**
 * Enables stacking of columns on a chart.
 * 
 * @param chartObject chart
 * @returns chartObject chart (changed)
 */
function enableStacking(chart) {
    var options = chart.options; // Copy Chart Options
    var plotOptions = options.plotOptions; //Copy Plot Options
    var columnOptions = plotOptions.column; //Copy Column Options
    var barOptions = plotOptions.bar;

    barOptions.stacking = 'normal';
    columnOptions.stacking = 'normal'; //Add stacking to Column Options

    plotOptions.bar = barOptions;
    plotOptions.column = columnOptions; // Set Back Column Options
    options.plotOptions = plotOptions; //Set  back Plot Options
    chart.options = options; // Set back Chart Options

    return chart;
}

