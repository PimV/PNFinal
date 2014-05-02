var costAjax;

$(document).ready(function() {
    var tabs = $("#cost-tabs").tabs();

   
    
    // close icon: removing the tab on click
    tabs.delegate("span.ui-icon-close", "click", function() {
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        tabs.tabs("refresh");
    });

    tabs.bind("keyup", function(event) {
        if (event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE) {
            var panelId = tabs.find(".ui-tabs-active").remove().attr("aria-controls");
            $("#" + panelId).remove();
            tabs.tabs("refresh");
        }
    });
});

/**
 * Retrieve the "cost" data and fill the tables in the "cost" block
 */
function determineCosts(beaconIds) {
    if (costAjax) {
        costAjax.abort();
    }
    var budget = 15000;
    var dimensions = ["flx_pixel_id"]; //(campiagn ID to be added later on);
    var measures = [["flx_pixels_sum", "flx_uuid_distinct"]];
    var orderType = "desc";
    $("#cost-pixel-table").find("tr:gt(0)").remove();
    $('#cost-pixel').fadeTo(1000, '0.5');
    $('#cost-pixel-spinner').fadeTo(1000, '1.0');
    costAjax = $.ajax({
        url: '/application/api/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, orderType: orderType},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }

            /* Loop through result to fill cost-pixel table */
            $.each(resp[0]['data'], function(i, data) {
                budget = 15000 * Math.random();
                $('#cost-pixel-table tr:last').after(
                        '<tr>' +
                        '<td>' + getBeaconById(data["flx_pixel_id"]) + '</td>' +
                        '<td>$ ' + formatNumber((budget / parseFloat(data['flx_pixels_sum']) * 1000), 3) + '</td>' +
                        '<td>$ ' + formatNumber((budget / parseFloat(data["flx_uuid_distinct"]) * 1000), 3) + '</td>' +
                        '</tr>');
            });
        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            /* Reset visuals */
            $('#cost-pixel').fadeTo(1000, '1.0');
            $('#cost-pixel-spinner').fadeTo(1000, '0');
            console.log("Updating Costs: Done!");
        }
    });
}