var totalViews;
var avgTimeOnSite;
var uniqueUsers;

function getTotalViews(beaconIds) {
    $.ajax({
        url: '/visualization/advertiser/viz-data',
        method: 'POST',
        data: {dimension: "flx_pixel_id", measure: "flx_pixels_sum", beaconIds: beaconIds},
        dataType: 'json',
        success: function(resp) {
            totalViews = 0;
            $.each(resp['response']['data'][0]['data'], function(i, data) {
                totalViews = +totalViews + parseFloat(data['flx_pixels_sum']);
            });
            console.log("Total Views: " + totalViews);
            totalViews = formatNumber(totalViews, 0);
            $('#total_view_count').text(totalViews);
        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            console.log("Updating total_view_count done.");
        }
    });
}

function getAvgTimeOnSite(beaconIds) {
    $.ajax({
        url: '/visualization/advertiser/viz-data',
        method: 'POST',
        data: {dimension: "flx_pixel_id", measure: "flx_time_on_site_avg", beaconIds: beaconIds},
        dataType: 'json',
        success: function(resp) {
            avgTimeOnSite = 0;
            var numberToAdd = 0;
            $.each(resp['response']['data'][0]['data'], function(i, data) {
                numberToAdd = parseFloat(data['flx_time_on_site_avg']);
                if (!isNaN(numberToAdd)) {
                    avgTimeOnSite = +avgTimeOnSite + numberToAdd;
                }
            });
            console.log("Average Time On Site: " + avgTimeOnSite);
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
            console.log("Updating avg_time_on_site done.");
        }
    });
}

function getUniqueUsers(beaconIds) {
    $.ajax({
        url: '/visualization/advertiser/viz-data',
        method: 'POST',
        data: {dimension: "flx_pixel_id", measure: "flx_uuid_distinct", beaconIds: beaconIds},
        dataType: 'json',
        success: function(resp) {
            uniqueUsers = 0;
            $.each(resp['response']['data'][0]['data'], function(i, data) {
                uniqueUsers = +uniqueUsers + parseFloat(data['flx_uuid_distinct']);
            });

            uniqueUsers = formatNumber(uniqueUsers, 0);

            $('#unique_user_count').text(uniqueUsers);
        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            console.log("Updating unique_user_count done.");
        }
    });
}

function getAllCumulativeValues(beaconIds) {
    
}

function updateCumulativeValues(beaconIds) {
    console.log("Updating");
    getAvgTimeOnSite(beaconIds);
    getUniqueUsers(beaconIds);
    getTotalViews(beaconIds);
}

function formatNumber(number, toFixed)
{
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