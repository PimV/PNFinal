var selectedValues;

$(function() {
    $("#beacon").multiselect({
        close: function(event, ui) {
            beaconIds = $('#beacon').val();
            if (selectionChanged(beaconIds) === true) {
                showViewsOverTime(beaconIds);
                updateCumulativeValues(beaconIds);
                updateReferers(beaconIds);
                updateDomains(beaconIds);
            }
            selectedValues = beaconIds;
        }
    }).multiselectfilter();

    updateCumulativeValues($('#beacon').val());
    updateReferers($('#beacon').val());
    updateDomains($('#beacon').val());
    selectedValues = $('#beacon').val();
});


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