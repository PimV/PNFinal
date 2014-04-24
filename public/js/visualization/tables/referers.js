var totalViews;
var avgTimeOnSite;
var uniqueUsers;
var referersAjax;

function getReferers(beaconIds) {
    var dimensions = ["flx_referer_url"];
    var measures = ["flx_pixels_sum"];
    $("#referers-table").find("tr:gt(0)").remove();
    $('#referers').fadeTo(1000, '0.5');
    $('#referers-spinner').fadeTo(1000, '1.0');
    referersAjax = $.ajax({
        url: '/visualization/advertiser/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, limit: 15, orderType: "desc"},
        dataType: 'json',
        success: function(resp) {
            //Check valid response
            if ('undefined' === typeof resp) {
                return;
            }

            //Referers
            $.each(resp[0]['data'], function(i, data) {
                $('#referers-table tr:last').after('<tr><td>' + data["flx_referer_url"] + '</td><td>' + formatNumber(parseFloat(data["flx_pixels_sum"], 0)) + '</td></tr>');
            });

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            $('#referers').fadeTo(1000, '1.0');
            $('#referers-spinner').fadeTo(1000, '0');
            console.log("Updating Referers: Done!");
        }
    });
}

function updateReferers(beaconIds) {
    if (referersAjax) {
        referersAjax.abort();
    }

    console.log("Getting Referers: Started!");
    getReferers(beaconIds);
}

function resetSearch() {
    // clear the textbox
    $('#referers-search').val('');
    // show all table rows
    $('.norecords').remove();
    $('#referers-table tr').show();
    // make sure we re-focus on the textbox for usability
    $('#referers-search').focus();
}

// execute the search
$(document).ready(function() {
    jQuery.expr[':'].Contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
    };


    $('#referers-search').keyup(function() {
        // only search when there are 3 or more characters in the textbox
        if ($('#referers-search').val().length > 2) {
            // hide all rows
            $('#referers-table tr').hide();
            // show the header row
            $('#referers-table tr:first').show();
            // show the matching rows (using the containsNoCase from Rick Strahl)
            $('#referers-table tr td:contains(\'' + $('#referers-search').val() + '\')').parent().show();
        }
        else if ($('#referers-search').val().length == 0) {
            // if the user removed all of the text, reset the search
            resetSearch();
        }

        // if there were no matching rows, tell the user
        if ($('#referers-table tr:visible').length == 1) {
               $('.norecords').remove();
            $('#referers-table').append('<tr class="norecords"><td colspan="5" class="Normal">No records were found</td></tr>');
        }
    });
});
