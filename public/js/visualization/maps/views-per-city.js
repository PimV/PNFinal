/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var map;
var markers;
$(document).ready(function() {

    map = L.map('views-per-city-map').setView([52.5, 5.75], 6);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);
});

function addMarkers(beaconIds) {

    removeMarkers();
    markers = new L.LayerGroup();
    var dimensions = [["flx_geo_city", "flx_geo_long", "flx_geo_lat"]];
    $("#views-per-city-table").find("tr:gt(0)").remove();
    var measures = ["flx_pixels_sum"];
    $('#views-per-city').fadeTo(1000, '0.5');
    $('#views-per-city-spinner').fadeTo(1000, '1.0');
    domainsAjax = $.ajax({
        url: '/visualization/advertiser/viz-data-multiple',
        method: 'POST',
        data: {dimension: dimensions, measure: measures, beaconIds: beaconIds, orderType: "desc"},
        dataType: 'json',
        success: function(resp) {
            //Check valid response
            if ('undefined' === typeof resp) {
                return;
            }
            //Domains
            var largestViews;
            $.each(resp[0]['data'], function(i, data) {
                //Retrieve and parse data
                var long = parseFloat(data['flx_geo_lat']);
                var lat = parseFloat(data['flx_geo_long']);
                var city = data['flx_geo_city'];
                var pixel_views = data['flx_pixels_sum'];
                if (city !== '0') {
                    if (!largestViews) {
                        largestViews = pixel_views;
                    }



                    var circleRadius = calculateCircleRadius(largestViews, pixel_views);
                    //Create Marker
                    var circle = L.circle([long, lat], circleRadius, {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: calculateCircleOpacity(largestViews, pixel_views)
                    }).addTo(map);
                    circle.bindPopup(city + '<br/>' + pixel_views);
                    markers.addLayer(circle);

                    //Create Table

                    $('#views-per-city-table tr:last').after('<tr><td>' + city + '</td><td>' + formatNumber(parseFloat(pixel_views, 0)) + '</td></tr>');
                }
            });
            map.addLayer(markers);

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            $('#views-per-city').fadeTo(1000, '1.0');
            $('#views-per-city-spinner').fadeTo(1000, '0');
            console.log("Updating Domains: Done!");
        }
    });
}

function removeMarkers() {
    if (markers && map) {
        console.log("Markers removed");
        map.removeLayer(markers);
    }
}

function calculateCircleRadius(maxValue, currentValue) {
    return Math.round(100 * 100 * (currentValue / maxValue));
}

function calculateCircleOpacity(maxValue, currentValue) {
    var returnValue;
    
    returnValue = currentValue / maxValue;
    
    if (returnValue > 0.8) {
        returnValue = 0.8;
    } else if (returnValue < 0.2) {
        returnValue = 0.2;
    }
    
    return returnValue;
}

function resetCitySearch() {
    // clear the textbox
    $('#views-per-city-search').val('');
    // show all table rows
    $('.norecords').remove();
    $('#views-per-city-table tr').show();
    // make sure we re-focus on the textbox for usability
    $('#views-per-city-search').focus();
}

// execute the search
$(document).ready(function() {
    jQuery.expr[':'].Contains = function(a, i, m) {
        return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
    };


    $('#views-per-city-search').keyup(function() {
        // only search when there are 3 or more characters in the textbox
        if ($('#views-per-city-search').val().length > 2) {
            // hide all rows
            $('#views-per-city-table tr').hide();
            // show the header row
            $('#views-per-city-table tr:first').show();
            // show the matching rows (using the containsNoCase from Rick Strahl)
            $('#views-per-city-table tr td:contains(\'' + $('#views-per-city-search').val() + '\')').parent().show();
        }
        else if ($('#views-per-city-search').val().length == 0) {
            // if the user removed all of the text, reset the search
            resetCitySearch();
        }

        // if there were no matching rows, tell the user
        if ($('#views-per-city-table tr:visible').length == 1) {
            $('.norecords').remove();
            $('#views-per-city-table').append('<tr class="norecords"><td colspan="5" class="Normal">No records were found</td></tr>');
        }
    });
});
