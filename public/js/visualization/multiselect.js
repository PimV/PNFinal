$(function() {
    $("#beacon").multiselect({
        close: function(event, ui) {
            beaconIds = $('#beacon').val();
            console.log(beaconIds);
            showViewsOverTime(beaconIds);
            updateCumulativeValues(beaconIds);
        }
    }).multiselectfilter();

    updateCumulativeValues($('#beacon').val());
});