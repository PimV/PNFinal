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
function updateReferers(siteIds) {
    if (referersAjax) {
        referersAjax.abort();
    }
    console.log("Getting Referers: Started!");
    getReferers(siteIds);
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

function getReferers(siteIds) {
    /* Set dimensions/measures for the  "referers" block */
    //var dimensions = ["flx_referer_url"];
    //var measures = [["flx_pixels_sum", "flx_uuid_distinct", "flx_time_on_site_avg", "flx_form_field_click_sum"]];
    var methods = [{method: "Referrers.getWebsites", params: {period: "range", date: "2014-04-01,2014-05-05", filter_sort_column: 'nb_visits', expanded: 1}}];
    /* Set loading visuals */
    $('#referers').fadeTo(1000, '0.5');
    $('#referers-spinner').fadeTo(1000, '1.0');
    $("#referers-table").find("tr:gt(0)").remove();

    /* The AJAX Request */
    referersAjax = $.ajax({
        url: '/application/api/call-data',
        method: 'POST',
        data: {methods: methods, siteIds: siteIds},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }

            console.log(resp);
            $.each(resp[0], function(i, data) {
                if (data['label']) {
                    $('#referers-table tr:last').after(
                            '<tr>' +
                            '<td><input type="checkbox" value="' + data["label"] + '"></td>' +
                            '<td>' + data["label"] + '</td>' +
                            '<td>' + formatNumber(parseFloat(data["sum_daily_nb_uniq_visitors"], 0)) + '</td>' +
                            '<td>' + formatNumber(parseFloat(data["nb_visits"], 0)) + '</td>' +
                            '<td>' + formatNumber(parseFloat(data["nb_actions"], 0)) + '</td>' +
                            '<td>' + formatNumber(parseFloat(data["bounce_count"], 1)) + '</td>' +
                            '</tr>');
                } else {
                    $.each(data, function(i, entry) {
                        $('#referers-table tr:last').after(
                                '<tr>' +
                                '<td><input type="checkbox" value="' + entry["label"] + '"></td>' +
                                '<td>' + entry["label"] + '</td>' +
                                '<td>' + formatNumber(parseFloat(entry["sum_daily_nb_uniq_visitors"], 0)) + '</td>' +
                                '<td>' + formatNumber(parseFloat(entry["nb_visits"], 0)) + '</td>' +
                                '<td>' + formatNumber(parseFloat(entry["nb_actions"], 0)) + '</td>' +
                                '<td>' + formatNumber(parseFloat(entry["bounce_count"], 1)) + '</td>' +
                                '</tr>');
                    });
                }
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


