var chart;
/*
 * Convert the Google Spreadsheet to JSON format and gather valuable data
 */
function importGSS(json) {
    $(window).load(function() {
        var data = [];
        //Gather entry data
        console.log(json.feed.entry[0]);
        try {
            $.each(json['feed']['entry'], function(i, entry) {

                //Gather Key/Value pairs

                //var key = entry['gsx$bedrijf']['$t'];
                //var value = parseInt(entry['gsx$kpi']['$t']);
                var contentColName = "gsx$" + entry.content['$t'].split(':')[0];
                var key = entry.title['$t'];
                var value = parseInt(entry[contentColName]['$t']);
                console.log(value);
                
                data.push({name: key, y: value});


            });
            testGraph(data);
        } catch (e) {
            console.log("Could not load data: " + e.message);
        }

    });
}

function testGraph(data) {
    var options = {
        chart: {
            renderTo: 'container',
            type: 'column'
        },
        title: {
            text: '<div>Client Statistics</div>'
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                align: 'right'
            }
        },
        yAxis: {
        },
        series: [{
                name: "Random data",
                data: data
            }]
        ,
        tooltip: {
            shared: false,
            hideDelay: 5000
        }
    };

    chart = new Highcharts.Chart(options);
}

function sortLowToHigh(data) {
    data.sort(function(a, b) {
        var returnVal = a.y - b.y;
        console.log(returnVal);
        return returnVal;
    });
    return data;
}

function sortHighToLow(data) {
    data.sort(function(a, b) {
        var returnVal = b.y - a.y;
        console.log(returnVal);
        return returnVal;
    });
    return data;
}

