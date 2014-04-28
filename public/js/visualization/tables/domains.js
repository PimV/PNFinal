/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var domainsAjax;

function getDomains(beaconIds) {
    var dimensions = ["flx_site_domain"];
    var measures = ["flx_pixels_sum"];
    $("#domains-table").find("tr:gt(0)").remove();
    $('#domains').fadeTo(1000, '0.5');
    $('#domains-spinner').fadeTo(1000, '1.0');
    domainsAjax = $.ajax({
        url: '/visualization/advertiser/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, limit: 15, orderType: "desc"},
        dataType: 'json',
        success: function(resp) {
            //Check valid response
            if ('undefined' === typeof resp) {
                return;
            }

            //Domains
            $.each(resp[0]['data'], function(i, data) {
                $('#domains-table tr:last').after('<tr><td>' + data["flx_site_domain"] + '</td><td>' + formatNumber(parseFloat(data["flx_pixels_sum"], 0)) + '</td></tr>');
            });

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            $('#domains').fadeTo(1000, '1.0');
            $('#domains-spinner').fadeTo(1000, '0');
            console.log("Updating Domains: Done!");
        }
    });
}

function updateDomains(beaconIds) {
    if (domainsAjax) {
        domainsAjax.abort();
    }

    console.log("Getting Domains: Started!");
    getDomains(beaconIds);
}

function resetDomainSearch() {
    // clear the textbox
    $('#domains-search').val('');
    // show all table rows
    $('.norecords').remove();
    $('#domains-table tr').show();
    // make sure we re-focus on the textbox for usability
    $('#domains-search').focus();
}

// execute the search
$(document).ready(function() {
    jQuery.expr[':'].Contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
    };


    $('#domains-search').keyup(function() {
        // only search when there are 3 or more characters in the textbox
        if ($('#domains-search').val().length > 2) {
            // hide all rows
            $('#domains-table tr').hide();
            // show the header row
            $('#domains-table tr:first').show();
            // show the matching rows (using the containsNoCase from Rick Strahl)
            $('#domains-table tr td:contains(\'' + $('#domains-search').val() + '\')').parent().show();
        }
        else if ($('#domains-search').val().length == 0) {
            // if the user removed all of the text, reset the search
            resetDomainSearch();
        }

        // if there were no matching rows, tell the user
        if ($('#domains-table tr:visible').length == 1) {
            $('.norecords').remove();
            $('#domains-table').append('<tr class="norecords"><td colspan="5" class="Normal">No records were found</td></tr>');
        }
    });
});
