var popupChart;

$(document).ready(function() {
    hs.graphicsDir = "http://pubnext.pvdns.nl/img/graphics/";
    hs.outlinesDir = '/outlines/';
    hs.align = 'center';

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
        // var box1 = bootbox.alert('<div style="width: 1100px; height: 700px;" id="enlargedChartContainer"></div>');
        //box1.find('.modal-content').css({'width': '1200px', 'margin-left': '-300px'});

        /* Draw the chart in the popup */
        //console.log($(this).data('chartoptions'));
        //enlargeChart($(this).data("chart"), $(this).data("stockchart"));

    });

    hs.Expander.prototype.onAfterExpand = function() {
        console.log(this);
        console.log("waiting over");
        if (this.custom.chartOptions) {
            var popUpChartOptions = this.custom.chartOptions;
            console.log(popUpChartOptions);
            //if (!this.hasChart) {
            var renderTo = $('.highslide-body')[0];
            popUpChartOptions.chart.renderTo = renderTo;
            popUpChartOptions.chart.height = $('.highslide-body').parent().height();
            popUpChartOptions.chart.width = $('.highslide-body').parent().width();
            popUpChartOptions.chart.events.click = function() {
            };

            var hsChart = new Highcharts.StockChart(popUpChartOptions);


            //}
            //this.hasChart = true;
        }
    }
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

function enlargeChart(chartOptions, stockChart) {
    /* Remove content from enlargedChartContainer */
    if (popupChart) {
        console.log("Destroying previous popupchart");
        popupChart.destroy();
        $("#enlargedChartContainer").html("");
    }

    /* Retrieve the chartOptions from the given chartName */
    var actualChartOptions = window[chartOptions].options;
    $('#enlargedChartContainer .highcharts-container').removeClass();
    /* Initialize the chart */
    if (stockChart === true) {
        popupChart = new Highcharts.StockChart(Highcharts.merge(actualChartOptions, {
            chart: {
                renderTo: "enlargedChartContainer"
            }
        }));

        popupChart.render();
    } else {
        popupChart = new Highcharts.Chart(Highcharts.merge(actualChartOptions, {
            chart: {
                renderTo: "enlargedChartContainer"
            }
        }));
        popupChart.render();
    }

}