/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var selectedValues; //Selected Beacon IDs

$(document).ready(function() {
    /* ???????????? */
    $.expr[':'].Contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
    };

    /* Initiailize the publisher-select box */
    $("#publisher_select").multiselect({
        close: function(event, ui) {
        }
    }).multiselectfilter();

    /* Initialize the campaign-select box */
    $("#campaign_select").multiselect({
        close: function(event, ui) {
        }
    }).multiselectfilter();

    /* Initialize the beacon-select box */
    $("#beacon_select").multiselect({
        close: function(event, ui) {
            var siteIds = $('#beacon_select').val();
            if (selectionChanged(siteIds) === true) {
                showViewsOverTime(siteIds);
                updateCumulativeValues(siteIds);
                updateReferers(siteIds);
                // updateDomains(siteIds);
                addMarkers(siteIds);
                // determineCosts(siteIds);
            }
            selectedValues = siteIds;
        }
    }).multiselectfilter();

    /* Load all blocks on document ready */
    updateCumulativeValues($('#beacon_select').val());
    updateReferers($('#beacon_select').val());
//    updateDomains($('#beacon_select').val());
    addMarkers($('#beacon_select').val());
//    determineCosts($('#beacon_select').val());
    selectedValues = $('#beacon_select').val();
    $('#sortable-visuals').sortable({
        placeholder: "ui-state-highlight",
        connectWith: ".in-row-sortable",
        start: function(e, ui) {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.width(ui.item.width());
        },
        delay: 300
    });
    $('.in-row-sortable').sortable({
        placeholder: "ui-state-highlight",
        start: function(e, ui) {
            ui.placeholder.height(ui.item.height());
            ui.placeholder.width(ui.item.width());
        },
        delay: 300
    });

    // $('.in-row-sortable').sortable();
});


function getBeaconById(id) {
    if ($('#beacon_select option[value=' + id + ']').length > 0) {
        return $('#beacon_select option[value=' + id + ']').text();
    } else {
        return;
    }
}

/**
 * Check if a selection has been changed in the multi-select.
 * 
 * @param Array beaconIds
 * @returns {Boolean} true if changed
 */
function selectionChanged(beaconIds) {
    if (selectedValues) {
        var checkLength;
        if (beaconIds) {
            checkLength = beaconIds.length;
        } else {
            checkLength = 0;
        }
        if (selectedValues.length > beaconIds.length) {
            checkLength = selectedValues.length;
        }
        for (var i = 0; i < checkLength; i++) {
            if (selectedValues[i] !== beaconIds[i]) {
                return true;
            }
        }
    }
}