/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var map; //Global map
var markers; //Global marker array

$(document).ready(function() {
    /* Instantiate the Leaflet map and focus on the Netherlands */
    map = L.map('views-per-city-map').setView([52.5, 5.75], 6);

    /* Add tile layer to the map */
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);

    /* Action listener for "views-per-city-search" textbox */
    $('#views-per-city-search').keyup(function() {
        /* Only search if there are more than 3 characters entered */
        if ($('#views-per-city-search').val().length > 2) {
            /* Hide all rows */
            $('#views-per-city-table tr').hide();

            /* Show the header row */
            $('#views-per-city-table tr:first').show();

            /* Show results using the "Contains" Expression */
            $('#views-per-city-table tr td:contains(\'' + $('#views-per-city-search').val() + '\')').parent().show();
        }
        else if ($('#views-per-city-search').val().length == 0) {
            /* If there is no text, reset the search */
            resetCitySearch();
        }

        /* Give feedback if no results were found */
        if ($('#views-per-city-table tr:visible').length == 1) {
            $('.norecords').remove();
            $('#views-per-city-table').append('<tr class="norecords"><td colspan="5" class="Normal">No records were found</td></tr>');
        }
    });
});

/**
 * 
 * @param {type} beaconIds
 * @returns {undefined}
 */
function addMarkers(siteIds) {
    console.log("Getting Views per City: Started!");
    /* Remove any markers, if there were any */
    removeMarkers();

    /* Create a new LayerGroup */
    markers = new L.LayerGroup();

    /* Set dimensions/measures for the "views-per-city" block */
    var methods = [{method: "UserCountry.getCity", params: {period: "range", date: "2014-04-01,2014-05-05", filter_sort_column: 'nb_visits'}}];

    /* Set loading visuals */
    $("#views-per-city-table").find("tr:gt(0)").remove();
    $('#views-per-city').fadeTo(1000, '0.5');
    $('#views-per-city-spinner').fadeTo(1000, '1.0');

    /* The AJAX Request */

    domainsAjax = $.ajax({
        url: '/application/api/call-data',
        method: 'POST',
        data: {methods: methods, siteIds: siteIds},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }

            /* Loop through response to get useful data for the views-per-city-map */
            var largestViews;
            var allResults = [];
            console.log(Object.keys(resp).length);
            $.each(resp[0], function(i, data) {
                $.each(data, function(i, cityEntry) {
                    var long = cityEntry['long'];
                    var lat = cityEntry['lat'];
                    var key = long + ":" + lat;
                    var city = cityEntry['city_name'];
                    var pixel_views = parseFloat(cityEntry['nb_visits']);

                    if (key in allResults) {
                        allResults[key].value = parseFloat(allResults[key].value) + parseFloat(pixel_views);
                    } else {
                        allResults[key] = {key: key, city: city, value: pixel_views};
                    }





                });
            });
            for (var latlng in allResults)
            {

                var result = allResults[latlng];
                if (result.key) {
                    /* Retrieve values */
                    var lat = result.key.split(':')[0];
                    var long = result.key.split(':')[1];

                    var city = result.city;
                    var pixel_views = result.value;

                    /* Check if city string equals to "0". If it is "0", don't use
                     the data */
                    if (city !== 'Unknown') {
                        if (!largestViews) {
                            largestViews = pixel_views;
                        }

                        /* Create circle marker */
                        createMarker(largestViews, pixel_views, long, lat, city);

                        /* Add retrieved data to table */
                        addToViewsPerCityTable(city, pixel_views);
                    }

                }


            }
            /* Add all the retrieved markers to the map */
            map.addLayer(markers);

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            /* Reset visuals */
            $('#views-per-city').fadeTo(1000, '1.0');
            $('#views-per-city-spinner').fadeTo(1000, '0');
            console.log("Updating Views per City: Done!");
        }
    });
}

/**
 * Creates a circle marker by the given parameters.
 * 
 * @param Integer largestViews
 * @param Integer pixel_views
 * @param Float long
 * @param Float lat
 * @param String city
 */
function createMarker(largestViews, pixel_views, long, lat, city) {
    var circleRadius = calculateCircleRadius(largestViews, pixel_views);
    var circle = L.circle([long, lat], circleRadius, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: calculateCircleOpacity(largestViews, pixel_views)
    });
    circle.bindPopup(city + '<br/>' + pixel_views);
    markers.addLayer(circle);
}

/**
 * Adds a row to the "views-per-city-table" table with the given parameters.
 * 
 * @param String city
 * @param Integer pixel_views
 */
function addToViewsPerCityTable(city, pixel_views) {
    $('#views-per-city-table tr:last').after('<tr><td>' + city + '</td><td>' + formatNumber(parseFloat(pixel_views, 0)) + '</td></tr>');
}

/**
 * Remove all the markers from the map by removing the marker layer.
 */
function removeMarkers() {
    if (markers && map) {
        console.log("Markers removed");
        map.removeLayer(markers);
    }
}

/**
 * Calculates a circle radius by a given current value over a max value.
 * 
 * Max radius = 100px;
 * Min radius = 10px; (Default by Leaflet)
 * 
 * @param Integer maxValue
 * @param Integer currentValue
 * @returns Integer circleRadius
 */
function calculateCircleRadius(maxValue, currentValue) {
    return Math.round(100 * 100 * (currentValue / maxValue));
}

/**
 * Calculates a circle radius by a given current value over a max value.
 * 
 * Max opacity = 0.8
 * Min opacity = 0.2
 * 
 * @param {type} maxValue
 * @param {type} currentValue
 * @returns Integer returnValue
 */
function calculateCircleOpacity(maxValue, currentValue) {
    var returnValue = currentValue / maxValue;
    if (returnValue > 0.8) {
        returnValue = 0.8;
    } else if (returnValue < 0.2) {
        returnValue = 0.2;
    }
    return returnValue;
}

/**
 * Reset the search for "views-per-city"
 */
function resetCitySearch() {
    /* Clear the search box */
    $('#views-per-city-search').val('');

    /* Show all table rows (and remove the .norecord row) */
    $('.norecords').remove();
    $('#views-per-city-table tr').show();

    /* (Re-)Focus the search box */
    $('#views-per-city-search').focus();
}
