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

    /* Initialize the multi-select box */
    $("#beacon").multiselect({
        close: function(event, ui) {
            beaconIds = $('#beacon').val();
            if (selectionChanged(beaconIds) === true) {
                showViewsOverTime(beaconIds);
                updateCumulativeValues(beaconIds);
                updateReferers(beaconIds);
                updateDomains(beaconIds);
                addMarkers(beaconIds);
            }
            selectedValues = beaconIds;
        }
    }).multiselectfilter();

    /* Load all blocks on document ready */
    updateCumulativeValues($('#beacon').val());
    updateReferers($('#beacon').val());
    updateDomains($('#beacon').val());
    addMarkers($('#beacon').val());
    selectedValues = $('#beacon').val();
});

/**
 * Check if a selection has been changed in the multi-select.
 * 
 * @param Array beaconIds
 * @returns {Boolean} true if changed
 */
function selectionChanged(beaconIds) {
    if (selectedValues) {
        var checkLength = beaconIds.length;
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