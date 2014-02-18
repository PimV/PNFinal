//Container Duplicates
var containerExistCount = 0;
//Google Spreadsheet variables
var google_key = null;
var sheetCount = 0;
var cfgSheetId = -1;
var sheets = [];
var configs = [];
//The container where the chart has to be placed in
var container = null;
//Chart variable defaults
var charts = [];
var chartTitle;
var chartType;
var sortType = null;
var xScale = 'linear';
var yScale = 'linear';


/*
 * Adding endsWith function to the String object.
 */
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
/*
 * Adding startsWith function to the String object.
 */
String.prototype.startsWith = function(prefix) {
    return(this.indexOf(prefix) === 0);
};
/*
 * Adding trim function to the String object.
 */
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
function loadDataDynamically(google_key, container) {
    $("#spinner").fadeIn("slow");
    console.log("Grabbing your data for spreadsheet with key: " + google_key);
    sheetCount = 0;
    sheets[google_key] = [];
    configs[google_key] = [];


    requestSpreadsheetInfo(google_key, container);

}

function requestSpreadsheetInfo(google_key, container) {

    $.ajax({
        url: 'https://spreadsheets.google.com/feeds/worksheets/' + google_key + '/public/basic?alt=json',
        type: 'GET',
        dataType: 'jsonp',
        async: true,
        success: function(resp) {
            sheetCount = resp['feed']['entry'].length;

            cfgSheetId = sheetCount;

            requestConfigSheet(google_key, cfgSheetId, container);
        },
        error: function(resp) {
            console.log("Error in spreadSheetInfo: " + resp);
        },
        complete: function(resp) {
        }
    });
}

function requestConfigSheet(google_key, cfgSheetId, container) {

    var url = 'http://spreadsheets.google.com/feeds/cells/' + google_key + '/' + cfgSheetId + '/public/values?alt=json&amp';

    $.ajax({
        url: '/ZF2HR/public/js/chartingEngine/request-data-rework.php',
        type: 'POST',
        data: {url: url},
        dataType: 'json',
        async: true,
        success: function(resp) {
            processConfigSheet(google_key, cfgSheetId, resp, container);
            for (var i = 1; i < cfgSheetId; i++) {
                requestSheetData(google_key, i, container);
            }
        },
        error: function(resp) {
            console.log("Error in configData: " + resp);
        }
    });
}

function requestSheetData(google_key, sheetId, container) {

    var url = 'http://spreadsheets.google.com/feeds/list/' + google_key + '/' + sheetId + '/public/values?alt=json&amp';

    $.ajax({
        url: '/ZF2HR/public/js/chartingEngine/request-data-rework.php',
        type: 'POST',
        data: {url: url},
        dataType: 'json',
        async: true,
        success: function(resp) {
            processSheet(google_key, sheetId, resp, container);
        },
        error: function(resp) {
            console.log("Error in sheetData: " + resp.message);
        }
    });
}

function processSheet(google_key, sheetId, json_response, container) {

    var sheetTitle = json_response['feed']['title']['$t'];
    if (!sheetTitle.startsWith('_')) {
        sheets[google_key][sheetId] = json_response;
        parseData(sheets[google_key][sheetId], sheetTitle, container, google_key);
    }
}

function processConfigSheet(google_key, sheetId, json_response) {
    configs[google_key] = [];
    configs[google_key]['json'] = json_response;
}

function loadConfigData(google_key) {
    configs[google_key]['chartTitle'] = configs[google_key]['json']['feed']['entry'][1].content['$t'];
    configs[google_key]['chartType'] = configs[google_key]['json']['feed']['entry'][3].content['$t'];
    configs[google_key]['sortType'] = configs[google_key]['json']['feed']['entry'][5].content['$t'];
    configs[google_key]['xScale'] = configs[google_key]['json']['feed']['entry'][7].content['$t'];
    configs[google_key]['yScale'] = configs[google_key]['json']['feed']['entry'][9].content['$t'];
}

function parseData(json, sheetTitle, container, google_key) {
    var dataSeries = [];
    var columnNames = getColumnNames(json);
    $.each(columnNames, function(i, contentColName) {
        var series = [];
        var singleChartTitle = sheetTitle;
        loadConfigData(google_key);

        $.each(json['feed']['entry'], function(i, entry) {

            var key = entry.title['$t'];
            var value = parseInt(entry[contentColName.id]['$t']);
            if (configs[google_key]['xScale'] === 'datetime') {
                key = new Date(key).getTime();
                series.push({name: key, x: key, y: value});
            } else {
                series.push({name: key, y: value});
            }
        });


        dataSeries.push({chartTitle: singleChartTitle, serie: {name: contentColName.name, data: series}});
    });
    generateChart(dataSeries, container, google_key);
}

/*
 * TO-DO: Optimize
 */
function getColumnNames(json) {
    var contentColNames = [];
    $.each(json['feed']['entry'], function(i, entry) {
        var columnNames = entry.content['$t'].split(',');
        $.each(columnNames, function(i, colName) {
            var contentColName = "gsx$" + colName.split(':')[0].trim();
            var columnObject = {name: colName.split(':')[0].trim(), id: contentColName};
            var inArray = false;
            for (var x = 0; x < contentColNames.length; x++) {
                if (contentColNames[x].id === columnObject.id) {
                    inArray = true;
                    break;
                }
            }
            if (inArray === false) {
                contentColNames.push(columnObject);
            }
        });
    });
    return contentColNames;
}

function generateChart(dataSeries, renderContainer, google_key) {

    loadConfigData(google_key);
    checkSortingType(google_key, dataSeries);
    renderContainer = checkContainer(renderContainer);

    var options = {
        chart: {
            renderTo: renderContainer,
            zoomType: 'y'
        },
        title: {
            text: '<div>' + configs[google_key]['chartTitle'] + '</div>'
        },
        xAxis: {
            type: configs[google_key]['xScale']
        },
        yAxis: {
            type: configs[google_key]['yScale']
        },
        tooltip: {
            shared: false,
            hideDelay: 5000
        },
        series: {
        }
    };
    var chart = null;
    if (configs[google_key]['chartType'] === 'StockChart') {
        chart = new Highcharts.StockChart(options);
    } else {
        options.chart.type = configs[google_key]['chartType'];
        chart = new Highcharts.Chart(options);
    }
    $.each(dataSeries, function(i, serie) {
        if (configs[google_key]['xScale'] === 'datetime') {
            chart.addSeries({name: serie.serie.name, x: serie.serie.x, data: serie.serie.data});
        } else {
            chart.addSeries({name: serie.serie.name, x: serie.serie.x, data: serie.serie.data});
        }

    });
    chart.setTitle({text: dataSeries[0].chartTitle});

    charts.push({containerName: renderContainer, chart: chart});
    $('#spinner').hide();



}

function checkContainer(renderContainer) {
    if ($("#" + renderContainer).length !== 0) {
        if ($("#" + renderContainer).text().length > 0) {
            console.log("Container length (" + renderContainer + "): " + $("#" + renderContainer).text().length);
            renderContainer = renderContainer + "_" + containerExistCount;
            appendDiv(renderContainer);
            console.log("Container already exists and is filled, creating a new one called '" + renderContainer + "'!");
            containerExistCount++;
        } else {
            console.log("Container (" + renderContainer + ") is empty, so chart can be added.");
        }
    } else {
        appendDiv(renderContainer);
    }

    return renderContainer;


}

function appendDiv(newContainerId) {
    $("#graphics").append('<div style="width: 800px; height: 400px; margin: 0 auto" id="' + newContainerId + '"></div>');
}

function checkSortingType(google_key, dataSeries) {
    if (configs[google_key]['sortType']) {
        if (configs[google_key]['sortType'] === 'ascending') {
            $.each(dataSeries, function(i, series) {
                sortLowToHigh(series.serie.data);
            });

        } else if (configs[google_key]['sortType'] === 'descending') {
            $.each(dataSeries, function(i, series) {
                sortHighToLow(series.serie.data);
            });
        } else {

        }
    }
}

function sortLowToHigh(data) {
    data.sort(function(a, b) {
        var returnVal = a.y - b.y;
        return returnVal;
    });
    return data;
}

function sortHighToLow(data) {
    data.sort(function(a, b) {
        var returnVal = b.y - a.y;
        return returnVal;
    });
    return data;
}