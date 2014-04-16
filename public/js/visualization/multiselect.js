$(function() {
    $("#beacon").multiselect({
        close: function(event, ui) {
            beaconIds = $('#beacon').val();
            console.log(beaconIds);
            showViewsOverTime(beaconIds);
        }
    }).multiselectfilter();


});