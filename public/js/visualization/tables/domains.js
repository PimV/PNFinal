/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var domainsAjax;

$(document).ready(function() {
    /* Action listener for "domains-search" textbox */
    $('#domains-search').keyup(function() {
        /* Only search if there are more than 3 characters entered */
        if ($('#domains-search').val().length > 2) {
            /* Hide all rows */
            $('#domains-table tr').hide();
            /* Show the header row */
            $('#domains-table tr:first').show();
            /* Show results using the "Contains" Expression */
            $('#domains-table tr td:contains(\'' + $('#domains-search').val() + '\')').parent().show();
        }
        else if ($('#domains-search').val().length == 0) {
            /* If there is no text, reset the search */
            resetDomainSearch();
        }

        /* Give feedback if no results were found */
        if ($('#domains-table tr:visible').length == 1) {
            $('.norecords').remove();
            $('#domains-table').append('<tr class="norecords"><td colspan="5" class="Normal">No records were found</td></tr>');
        }
    });
});

/**
 * Updates the "domains" block. If beaconIds are present, will only
 * update with data belonging to those beaconIds.
 * 
 * @param Array beaconIds
 */
function updateDomains(beaconIds) {
    if (domainsAjax) {
        domainsAjax.abort();
    }
    console.log("Getting Domains: Started!");
    getDomains(beaconIds);
}

/**
 * 
 * 
 * @param Array beaconIds
 */
function getDomains(beaconIds) {
    /* Set dimensions/measures for the  "domain" block */
    var dimensions = ["flx_site_domain"];
    var measures = ["flx_pixels_sum"];

    /* Set loading visuals */
    $("#domains-table").find("tr:gt(0)").remove();
    $('#domains').fadeTo(1000, '0.5');
    $('#domains-spinner').fadeTo(1000, '1.0');

    /* The AJAX Request */
    domainsAjax = $.ajax({
        url: '/visualization/advertiser/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, limit: 15, orderType: "desc"},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }

            /* Loop through response to get useful data and store it in the "domains-table" table. */
            $.each(resp[0]['data'], function(i, data) {
                $('#domains-table tr:last').after('<tr><td>' + data["flx_site_domain"] + '</td><td>' + formatNumber(parseFloat(data["flx_pixels_sum"], 0)) + '</td></tr>');
            });

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            /* Reset visuals */
            $('#domains').fadeTo(1000, '1.0');
            $('#domains-spinner').fadeTo(1000, '0');
            console.log("Updating Domains: Done!");
        }
    });
}

/**
 * Reset the search for "domains"
 */
function resetDomainSearch() {
    /* Clear the search box */
    $('#domains-search').val('');

    /* Show all table rows (and remove the .norecord row) */
    $('.norecords').remove();
    $('#domains-table tr').show();

    /* (Re-)Focus the search box */
    $('#domains-search').focus();
}

