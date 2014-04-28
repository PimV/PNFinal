/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var cumulativeValuesAjax;

function getAllCumulativeValues(beaconIds) {
    var dimensions = ["flx_pixel_id", "flx_pixel_id", "flx_pixel_id"];
    var measures = ["flx_pixels_sum", "flx_uuid_distinct", "flx_time_on_site_avg"];
    $('#cumulative-values').fadeTo(1000, '0.5');
    $('#cumulative-values-spinner').fadeTo(1000, '1.0');
    cumulativeValuesAjax = $.ajax({
        url: '/visualization/advertiser/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }

            /* Total Views */
            totalViews = 0;
            $.each(resp[0]['data'], function(i, data) {
                totalViews = +totalViews + parseFloat(data['flx_pixels_sum']);
            });
            totalViews = formatNumber(totalViews, 0);
            $('#total_view_count').text(totalViews);

            /* Unique Users */
            uniqueUsers = 0;
            $.each(resp[1]['data'], function(i, data) {
                uniqueUsers = +uniqueUsers + parseFloat(data['flx_uuid_distinct']);
            });
            uniqueUsers = formatNumber(uniqueUsers, 0);
            $('#unique_user_count').text(uniqueUsers);

            /* Average Time on Article */
            avgTimeOnSite = 0;
            var numberToAdd = 0;
            $.each(resp[2]['data'], function(i, data) {
                numberToAdd = parseFloat(data['flx_time_on_site_avg']);
                if (!isNaN(numberToAdd)) {
                    avgTimeOnSite = +avgTimeOnSite + numberToAdd;
                }
            });
            var division = 1;
            if (beaconIds) {
                division = beaconIds.length;
            }
            avgTimeOnSite = (avgTimeOnSite / division);
            avgTimeOnSite = formatNumber(avgTimeOnSite);
            $('#avg_time_on_site').text(avgTimeOnSite);
        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            /* Reset visuals */
            $('#cumulative-values').fadeTo(1000, '1.0');
            $('#cumulative-values-spinner').fadeTo(1000, '0');
            console.log("Updating Cumulative Values: Done!");
        }
    });
}

/**
 * Updates the "cumulative-values" block. If beaconIds are present, will only
 * update with data belonging to those beaconIds.
 * 
 * @param Array beaconIds
 */
function updateCumulativeValues(beaconIds) {
    if (cumulativeValuesAjax) {
        cumulativeValuesAjax.abort();
    }
    console.log("Getting Cumulative Values: Started!");
    getAllCumulativeValues(beaconIds);
}

/**
 * Formats a given number to a fixed amount of digits.
 * 
 * @param Integer number
 * @param Integer toFixed
 * @returns String returnedNumber
 */
function formatNumber(number, toFixed) {
    number = number.toFixed(toFixed) + '';
    x = number.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}