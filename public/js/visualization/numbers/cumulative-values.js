/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */
var totalViewsData;
var uniqueUsersData;
var avgTimeOnSiteData;
var clickCountData;

var cumulativeValuesAjax;

function getAllCumulativeValues(siteIds) {
    var methods = [
        {method: "VisitsSummary.get", params: {period: "range", date: "2014-05-05,yesterday", expanded: 1, flat: 0}},
        {method: "VisitsSummary.getUniqueVisitors", params: {period: "range", date: "2014-05-05,yesterday", expanded: 1, flat: 0}}
    ];
    var orderType = "desc";
    $('#cumulative-values').fadeTo(1000, '0.5');
    $('#cumulative-values-spinner').fadeTo(1000, '1.0');
    cumulativeValuesAjax = $.ajax({
        url: '/application/api/call-data',
        method: 'POST',
        data: {methods: methods, siteIds: siteIds},
        dataType: 'json',
        success: function(resp) {
            /* Check if response is valid */
            if ('undefined' === typeof resp) {
                return;
            }

            //console.log(resp);
            /* Visits, Actions, Bounce, Avg Time On Site */
            getVisitCount(resp[0]);
            getActionCount(resp[0]);
            //getBounceCount(resp[0]);
            getBounceRate(resp[0]);
            getAvgTimeOnSite(resp[0]);
            getUniqueVisitors(resp[1]);

        },
        error: function(resp) {
            console.log(resp);
        },
        complete: function() {
            /* Reset visuals */
            $('#cumulative-values').fadeTo(1000, '1.0');
            $('#cumulative-values-spinner').fadeTo(1000, '0');
            console.log("Updating Cumulative Values: Done!");
        }
    });
}

function getVisitCount(resp) {
    var totalVisits = 0;
    var totalVisitsTooltipText;
    var addCount = 0;

    /* Is only one site selected? */
    if (resp['nb_visits']) {
        totalVisits = resp['nb_visits'];
    } else {
        var totalVisitsTooltipText = "Top {addedToTop5} sites: <br/><br/>";
        var allResults = [];
        $.each(resp, function(i, site) {
            if (!isNaN(parseFloat(site["nb_visits"]))) {
                totalVisits = +totalVisits + parseFloat(site["nb_visits"]);
                allResults.push({name: getBeaconById(i), value: parseFloat(site["nb_visits"])});
            }
        });
    }
    if (allResults) {
        allResults.sort(function(a, b) {
            return b.value - a.value;
        });
        $.each(allResults, function(i, top5entry) {
            if (i > 4) {
                return;
            }
            totalVisitsTooltipText += top5entry.name + ": " + formatNumber(parseFloat(top5entry.value, 0)) + " total visits<br/>";
            addCount = i + 1;
        });
    }
    totalVisits = formatNumber(totalVisits, 0);
    $('#total_view_count').text(totalVisits);
    if (totalVisitsTooltipText) {
        totalVisitsTooltipText = totalVisitsTooltipText.replace('{addedToTop5}', addCount);
        $('#pixels').attr("original-title", totalVisitsTooltipText);
        $('#pixels').tipsy({html: true});
    } else {
        $('#pixels').attr("original-title", "");
    }
}

function getActionCount(resp) {
    var totalActions = 0;
    var totalActionsTooltipText;
    var addCount = 0;

    /* Is only one site selected? */
    if (resp['nb_actions']) {
        totalActions = resp['nb_actions'];
    } else {
        var totalActionsTooltipText = "Top {addedToTop5} sites: <br/><br/>";
        var allResults = [];
        $.each(resp, function(i, site) {
            if (!isNaN(parseFloat(site["nb_actions"]))) {
                totalActions = +totalActions + parseFloat(site["nb_actions"]);
                allResults.push({name: getBeaconById(i), value: parseFloat(site["nb_actions"])});
            }
        });
    }
    if (allResults) {
        allResults.sort(function(a, b) {
            return b.value - a.value;
        });
        $.each(allResults, function(i, top5entry) {
            if (i > 4) {
                return;
            }
            totalActionsTooltipText += top5entry.name + ": " + formatNumber(parseFloat(top5entry.value, 0)) + " total actions<br/>";
            addCount = i + 1;

        });
    }
    totalActions = formatNumber(totalActions, 0);
    $('#click_count').text(totalActions);
    if (totalActionsTooltipText) {
        totalActionsTooltipText = totalActionsTooltipText.replace('{addedToTop5}', addCount);
        $('#form-clicks').attr("original-title", totalActionsTooltipText);
        $('#form-clicks').tipsy({html: true});
    } else {
        $('#form-clicks').attr("original-title", "");
    }
}

function getAvgTimeOnSite(resp) {
    //avg_time_on_site
    var avgTimeOnSite = 0;
    var avgTimeOnSiteTooltipText;
    var addCount = 0;

    /* Is only one site selected? */
    if (resp['avg_time_on_site']) {
        avgTimeOnSite = resp['avg_time_on_site'];
    } else {
        var avgTimeOnSiteTooltipText = "Top {addedToTop5} sites: <br/><br/>";
        var items = 0;
        var allResults = [];
        $.each(resp, function(i, site) {
            if (!isNaN(parseFloat(site["avg_time_on_site"]))) {
                avgTimeOnSite = +avgTimeOnSite + parseFloat(site["avg_time_on_site"]);
                items++;
                allResults.push({name: getBeaconById(i), value: parseFloat(site["avg_time_on_site"], 0)});
            }
        });
    }
    var division = 1;
    if (items) {
        division = items;
    }
    avgTimeOnSite = (avgTimeOnSite / division);
    if (allResults) {
        allResults.sort(function(a, b) {
            return b.value - a.value;
        });
        $.each(allResults, function(i, top5entry) {
            if (i > 4) {
                return;
            }
            avgTimeOnSiteTooltipText += top5entry.name + ": " + formatNumber(parseFloat(top5entry.value, 0)) + " s<br/>";
            addCount = i + 1;

        });
    }
    avgTimeOnSite = formatNumber(avgTimeOnSite, 0);
    $('#avg_time_on_site').text(avgTimeOnSite);
    if (avgTimeOnSiteTooltipText) {
        avgTimeOnSiteTooltipText = avgTimeOnSiteTooltipText.replace('{addedToTop5}', addCount);
        $('#avg-time-on-site').attr("original-title", avgTimeOnSiteTooltipText);
        $('#avg-time-on-site').tipsy({html: true});
    } else {
        $('#avg-time-on-site').attr("original-title", "");
    }
}

/*
 * NBACTIONS MOET WORDEN NB_UNIQ_VISITORS!!
 * 
 * @param {type} resp
 * @returns {undefined}
 */
function getUniqueVisitors(resp) {
    var totalUniqueVisitors = 0;
    var totalUniqueVisitorsTooltipText;
    var addCount = 0;

    /* Is only one site selected? */
    if (resp['nb_actions']) {
        totalUniqueVisitors = resp['nb_actions'];
    } else {
        var totalUniqueVisitorsTooltipText = "Top {addedToTop5} sites: <br/><br/>";
        var allResults = [];
        $.each(resp, function(i, site) {
            if (!isNaN(parseFloat(site["nb_actions"]))) {
                totalUniqueVisitors = +totalUniqueVisitors + parseFloat(site["nb_actions"]);
                allResults.push({name: getBeaconById(i), value: parseFloat(site["nb_actions"])});
            }
        });
    }
    if (allResults) {
        allResults.sort(function(a, b) {
            return b.value - a.value;
        });
        $.each(allResults, function(i, top5entry) {
            if (i > 4) {
                return;
            }
            totalUniqueVisitorsTooltipText += top5entry.name + ": " + formatNumber(parseFloat(top5entry.value, 0)) + " s<br/>";
            addCount = i + 1;

        });
    }
    totalUniqueVisitors = formatNumber(totalUniqueVisitors, 0);
    $('#unique_user_count').text(totalUniqueVisitors);
    if (totalUniqueVisitorsTooltipText) {
        totalUniqueVisitorsTooltipText = totalUniqueVisitorsTooltipText.replace('{addedToTop5}', addCount);
        $('#unique-users').attr("original-title", totalUniqueVisitorsTooltipText);
        $('#unique-users').tipsy({html: true});
    } else {
        $('#unique-users').attr("original-title", "");
    }
}

function getBounceRate(resp) {
    var bounceRate = 0;
    var bounceRateTooltipText;
    var addCount = 0;

    /* Is only one site selected? */
    if (resp['bounce_rate']) {
        bounceRate = resp['bounce_rate'];
    } else {
        bounceRateTooltipText = "Top {addedToTop5} sites: <br/><br/>";
        var allResults = [];
        var items = 0;
        $.each(resp, function(i, site) {
            if (!isNaN(parseFloat(site["bounce_rate"]))) {
                bounceRate = +bounceRate + parseFloat(site["bounce_rate"]);
                items++;
                allResults.push({name: getBeaconById(i), value: parseFloat(site["bounce_rate"])});
            }
        });
    }
    var division = 1;
    if (items) {
        division = items;
    }
    bounceRate = (bounceRate / division);
    if (allResults) {
        allResults.sort(function(a, b) {
            return b.value - a.value;
        });
        $.each(allResults, function(i, top5entry) {
            if (i > 4) {
                return;
            }
            bounceRateTooltipText += top5entry.name + ": " + formatNumber(parseFloat(top5entry.value, 0)) + " %<br/>";
            addCount = i + 1;

        });
    }
    bounceRate = formatNumber(bounceRate, 0);
    $('#bounce_rate').text(bounceRate);
    if (bounceRateTooltipText) {
        bounceRateTooltipText = bounceRateTooltipText.replace('{addedToTop5}', addCount);
        $('#bounce-rate').attr("original-title", bounceRateTooltipText);
        $('#bounce-rate').tipsy({html: true});
    } else {
        $('#bounce-rate').attr("original-title", "");
    }
}

function parseUniqueUsers(uniqueUsersArray) {
    uniqueUsersData = uniqueUsersArray;
    var uniqueUsers = 0;
    var uniqueUsersTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
    var addCount = 0;
    $.each(uniqueUsersArray['data'], function(i, data) {

        uniqueUsers = +uniqueUsers + parseFloat(data['flx_uuid_distinct']);
        if (addCount < 5) {
            addCount++;
            uniqueUsersTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(parseFloat(data['flx_uuid_distinct'], 0)) + " unique users<br/>";
        }
    });
    uniqueUsers = formatNumber(uniqueUsers, 0);
    $('#unique_user_count').text(uniqueUsers);
    uniqueUsersTooltipText = uniqueUsersTooltipText.replace('{addedToTop5}', addCount);
    $('#unique-users').attr("original-title", uniqueUsersTooltipText);
    $('#unique-users').tipsy({html: true});
}

function parseAvgTimeOnSite(avgTimeOnSiteArray, beaconIds) {
    avgTimeOnSiteData = avgTimeOnSiteArray;
    var avgTimeOnSite = 0;
    var avgTimeOnSiteTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
    var addCount = 0;
    var numberToAdd = 0;
    $.each(avgTimeOnSiteArray['data'], function(i, data) {
        numberToAdd = parseFloat(data['flx_time_on_site_avg']);
        if (!isNaN(numberToAdd)) {

            avgTimeOnSite = +avgTimeOnSite + numberToAdd;
            if (addCount < 5) {
                addCount++;
                avgTimeOnSiteTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(numberToAdd, 1) + "s<br/>";
            }
        }
    });
    var division = 1;
    if (beaconIds) {
        division = beaconIds.length;
    }
    avgTimeOnSite = (avgTimeOnSite / division);
    avgTimeOnSite = formatNumber(avgTimeOnSite);
    $('#avg_time_on_site').text(avgTimeOnSite);
    avgTimeOnSiteTooltipText = avgTimeOnSiteTooltipText.replace('{addedToTop5}', addCount);
    $('#avg-time-on-site').attr("original-title", avgTimeOnSiteTooltipText);
    $('#avg-time-on-site').tipsy({html: true});
}

function parseFormClicks(formClickArray) {
    clickCountData = formClickArray;
    var clickCount = 0;
    var clickCountTooltipText = "Top {addedToTop5} pixels: <br/><br/>";
    var addCount = 0;
    $.each(formClickArray['data'], function(i, data) {
        if (!isNaN(parseFloat(data['flx_form_field_click_sum']))) {

            clickCount = +clickCount + parseFloat(data['flx_form_field_click_sum']);
            if (addCount < 5) {
                addCount++;
                clickCountTooltipText += getBeaconById(data['flx_pixel_id']) + ": " + formatNumber(parseFloat(data['flx_form_field_click_sum'], 0)) + " form clicks<br/>";
            }
        }
    });
    clickCount = formatNumber(clickCount, 0);
    $('#click_count').text(clickCount);
    clickCountTooltipText = clickCountTooltipText.replace('{addedToTop5}', addCount);
    $('#form-clicks').attr("original-title", clickCountTooltipText);
    $('#form-clicks').tipsy({html: true});
}

/**
 * Updates the "cumulative-values" block. If beaconIds are present, will only
 * update with data belonging to those beaconIds.
 * 
 * @param Array beaconIds
 */
function updateCumulativeValues(siteIds) {
    if (cumulativeValuesAjax) {
        cumulativeValuesAjax.abort();
    }
    console.log("Getting Cumulative Values: Started!");
    //console.log(siteIds);
    getAllCumulativeValues(siteIds);

}

/**
 * Formats a given number to a fixed amount of digits.
 * 
 * @param Integer number
 * @param Integer toFixed
 * @returns String returnedNumber
 */
function formatNumber(number, toFixed) {
    if (isNaN(number)) {
        return "-";
    }
    number = number.toFixed(toFixed) + '';
    x = number.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }

    return x1 + x2;
}