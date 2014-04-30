/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */
var totalViewsData;
var uniqueUsersData;
var avgTimeOnSiteData;
var clickCountData;

var cumulativeValuesAjax;

function getAllCumulativeValues(beaconIds) {
    var dimensions = ["flx_pixel_id", "flx_pixel_id", "flx_pixel_id", "flx_pixel_id"];
    var measures = ["flx_pixels_sum", "flx_uuid_distinct", "flx_time_on_site_avg", "flx_form_field_click_sum"];
    var orderType = "desc";
    $('#cumulative-values').fadeTo(1000, '0.5');
    $('#cumulative-values-spinner').fadeTo(1000, '1.0');
    cumulativeValuesAjax = $.ajax({
        url: '/application/api/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, orderType: orderType},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }

            /* Add count for top 5 */
            var addCount = 0;

            /* Total Views */
            parseTotalViews(resp[0]);
//            totalViewsData = resp[0];
//            var totalViews = 0;
//            var totalViewsTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
//            addCount = 0;
//            $.each(resp[0]['data'], function(i, data) {
//
//                totalViews = +totalViews + parseFloat(data['flx_pixels_sum']);
//                if (addCount < 5) {
//                    addCount++;
//                    totalViewsTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(parseFloat(data['flx_pixels_sum'], 0)) + " pixel loads<br/>";
//                }
//            });
//            totalViews = formatNumber(totalViews, 0);
//            $('#total_view_count').text(totalViews);
//            totalViewsTooltipText = totalViewsTooltipText.replace('{addedToTop5}', addCount);
//            $('#pixels').attr("original-title", totalViewsTooltipText);
//            $('#pixels').tipsy({html: true});

            /* Unique Users */
            uniqueUsersData = resp[1];
            var uniqueUsers = 0;
            var uniqueUsersTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
            addCount = 0;
            $.each(resp[1]['data'], function(i, data) {

                uniqueUsers = +uniqueUsers + parseFloat(data['flx_uuid_distinct']);
                if (addCount < 5) {
                    addCount++;
                    uniqueUsersTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(parseFloat(data['flx_uuid_distinct'], 0)) + " unique users<br/>";
                }
            });
            uniqueUsers = formatNumber(uniqueUsers, 0);
            $('#unique_user_count').text(uniqueUsers);
            uniqueUsersTooltipText = uniqueUsersTooltipText.replace('{addedToTop5}', addCount);
            $('#unique-users').attr("original-title", uniqueUsersTooltipText);
            $('#unique-users').tipsy({html: true});

            /* Average Time on Article */
            avgTimeOnSiteData = resp[2];
            var avgTimeOnSite = 0;
            var avgTimeOnSiteTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
            addCount = 0;
            var numberToAdd = 0;
            $.each(resp[2]['data'], function(i, data) {
                numberToAdd = parseFloat(data['flx_time_on_site_avg']);
                if (!isNaN(numberToAdd)) {

                    avgTimeOnSite = +avgTimeOnSite + numberToAdd;
                    if (addCount < 5) {
                        addCount++;
                        avgTimeOnSiteTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(numberToAdd, 1) + "s<br/>";
                    }
                }
            });
            var division = 1;
            if (beaconIds) {
                division = beaconIds.length;
            }
            avgTimeOnSite = (avgTimeOnSite / division);
            avgTimeOnSite = formatNumber(avgTimeOnSite);
            $('#avg_time_on_site').text(avgTimeOnSite);
            avgTimeOnSiteTooltipText = avgTimeOnSiteTooltipText.replace('{addedToTop5}', addCount);
            $('#avg-time-on-site').attr("original-title", avgTimeOnSiteTooltipText);
            $('#avg-time-on-site').tipsy({html: true});

            /* Click Count */
            clickCountData = resp[3];
            var clickCount = 0;
            var clickCountTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
            addCount = 0;
            $.each(resp[3]['data'], function(i, data) {
                if (!isNaN(parseFloat(data['flx_form_field_click_sum']))) {

                    clickCount = +clickCount + parseFloat(data['flx_form_field_click_sum']);
                    if (addCount < 5) {
                        addCount++;
                        clickCountTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(parseFloat(data['flx_form_field_click_sum'], 0)) + " form clicks<br/>";
                    }
                }
            });
            clickCount = formatNumber(clickCount, 0);
            $('#click_count').text(clickCount);
            clickCountTooltipText = clickCountTooltipText.replace('{addedToTop5}', addCount);
            $('#form-clicks').attr("original-title", clickCountTooltipText);
            $('#form-clicks').tipsy({html: true});
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

function parseTotalViews(totalViewsArray) {
    totalViewsData = totalViewsArray;
    var totalViews = 0;
    var totalViewsTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
    var addCount = 0;
    $.each(totalViewsArray['data'], function(i, data) {

        totalViews = +totalViews + parseFloat(data['flx_pixels_sum']);
        if (addCount < 5) {
            addCount++;
            totalViewsTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(parseFloat(data['flx_pixels_sum'], 0)) + " pixel loads<br/>";
        }
    });
    totalViews = formatNumber(totalViews, 0);
    $('#total_view_count').text(totalViews);
    totalViewsTooltipText = totalViewsTooltipText.replace('{addedToTop5}', addCount);
    $('#pixels').attr("original-title", totalViewsTooltipText);
    $('#pixels').tipsy({html: true});
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
    if (isNaN(number)) {
        return "-";
    }
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