/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var referersAjax;

$(document).ready(function() {
    /* Action listener for "referers-search" textbox */
    $('#referers-search').keyup(function() {
        /* Only search if there are more than 3 characters entered */
        if ($('#referers-search').val().length > 2) {
            /* Hide all rows */
            $('#referers-table tr').hide();
            /* Show the header row */
            $('#referers-table tr:first').show();
            /* Show results using the "Contains" Expression */
            $('#referers-table tr td:contains(\'' + $('#referers-search').val() + '\')').parent().show();
        }
        else if ($('#referers-search').val().length == 0) {
            /* If there is no text, reset the search */
            resetRefererSearch();
        }

        /* Give feedback if no results were found */
        if ($('#referers-table tr:visible').length == 1) {
            $('.norecords').remove();
            $('#referers-table').append('<tr class="norecords"><td colspan="5" class="Normal">No records were found</td></tr>');
        }
    });
    $('#selectAllReferers').on('change', function() {
        toggleAllReferers();
    });
});

/**
 * Updates the "referers" block. If beaconIds are present, will only
 * update with data belonging to those beaconIds.
 * 
 * @param Array beaconIds
 */
function updateReferers(beaconIds) {
    if (referersAjax) {
        referersAjax.abort();
    }
    console.log("Getting Referers: Started!");
    getReferers(beaconIds);
}

function toggleAllReferers() {
    if ($('#selectAllReferers').prop('checked') === true) {
        $('#referers-table input[type="checkbox"]').each(function() {
            this.checked = true;
        });
    } else {
        $('#referers-table input[type="checkbox"]').each(function() {
            this.checked = false;
        });
    }
}

function getReferers(beaconIds) {
    /* Set dimensions/measures for the  "referers" block */
    var dimensions = ["flx_referer_url"];
    var measures = [["flx_pixels_sum", "flx_uuid_distinct", "flx_time_on_site_avg", "flx_form_field_click_sum"]];

    /* Set loading visuals */
    $('#referers').fadeTo(1000, '0.5');
    $('#referers-spinner').fadeTo(1000, '1.0');
    $("#referers-table").find("tr:gt(0)").remove();

    /* The AJAX Request */
    referersAjax = $.ajax({
        url: '/application/api/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, limit: 15, orderType: "desc"},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }
            console.log(resp);
            /* Loop through response to get useful data and store it in the "referers-table" table. */
            $.each(resp[0]['data'], function(i, data) {
                $('#referers-table tr:last').after(
                        '<tr>' +
                        '<td><input type="checkbox" value="' + data["flx_site_domain"] + '"></td>' +
                        '<td>' + data["flx_referer_url"] + '</td>' +
                        '<td>' + formatNumber(parseFloat(data["flx_uuid_distinct"], 0)) + '</td>' +
                        '<td>' + formatNumber(parseFloat(data["flx_pixels_sum"], 0)) + '</td>' +
                        '<td>' + formatNumber(parseFloat(data["flx_form_field_click_sum"], 0)) + '</td>' +
                        '<td>' + formatNumber(parseFloat(data["flx_time_on_site_avg"], 1)) + '</td>' +
                        '</tr>');
            });

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            /* Reset visuals */
            $('#referers').fadeTo(1000, '1.0');
            $('#referers-spinner').fadeTo(1000, '0');
            console.log("Updating Referers: Done!");
        }
    });
}

function resetRefererSearch() {
    /* Clear the search box */
    $('#referers-search').val('');

    /* Show all table rows (and remove the .norecord row) */
    $('.norecords').remove();
    $('#referers-table tr').show();

    /* (Re-)Focus the search box */
    $('#referers-search').focus();
}


