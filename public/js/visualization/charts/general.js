var popupChart;

$(document).ready(function() {
    /* Action listener for any overlay. Fades in the overlay on hover, and if the
     user stops hovering, fades the overlay out again. */
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

    /* Actionlistener for the overlay. If clicked, opens the popup with an 
     enlarged chart */
    $('.overlay').on('click', function() {
        /* Show large modal */
        var box1 = bootbox.alert('<div style="width: 1100px; height: 700px;" id="enlargedChartContainer"></div>');
        box1.find('.modal-content').css({'width': '1200px', 'margin-left': '-300px'});

        /* Draw the chart in the popup */
        console.log($(this).data('chartoptions'));
        enlargeChart($(this).data("chartoptions"), $(this).data("stockchart"));

    });
});

/**
 * Creates the chart in the popup from the given chartName. Duplicates the 
 * options object from the given chartName and changes the 'renderTo' entry
 * to the popup container.
 * 
 * The stockChart boolean is there to define whether the chart-to-draw is a
 * Highcharts Stockchart or not.
 * 
 * @param String chartName
 * @param boolean stockChart
 */
//function enlargeChart(chartName, stockChart) {
//    /* Remove content from enlargedChartContainer */
//    if (popupChart) {
//        console.log("Destroying previous popupchart");
//        popupChart.destroy();
//    }
//
//    /* Retrieve the chartOptions from the given chartName */
//    var actualChartOptions = window[chartName].options;
//
//    /* Change the 'renderTo' entry from the chartOptions */
//    actualChartOptions.chart.renderTo = 'enlargedChartContainer';
//
//    /* Initialize the chart */
//
//    if (stockChart === true) {
//        popupChart = new Highcharts.StockChart(actualChartOptions);
//    } else {
//        popupChart = new Highcharts.Chart(actualChartOptions);
//    }
//}

function enlargeChart(chartOptions, stockChart) {
    /* Remove content from enlargedChartContainer */
//    if (popupChart) {
//        console.log("Destroying previous popupchart");
//        popupChart.destroy();
//    }

    /* Retrieve the chartOptions from the given chartName */
    var actualChartOptions = window[chartOptions];
    console.log(chartOptions);
    console.log(actualChartOptions);
    /* Change the 'renderTo' entry from the chartOptions */
    actualChartOptions.chart.renderTo = 'enlargedChartContainer';

    /* Initialize the chart */

    if (stockChart === true) {
        console.log("Popping up stockchart");
        popupChart = new Highcharts.StockChart(actualChartOptions);
    } else {
        console.log("Popping up normal chart");
        popupChart = new Highcharts.Chart(actualChartOptions);
    }
}