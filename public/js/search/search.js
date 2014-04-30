/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

/* Filter Boxes */
var catBoxes = $('input:checkbox.cats');
var langBoxes = $('input:checkbox.langs');

/* Slider */
var minPrice;
var maxPrice;
var slider;

/* Other filter buttons */
var enableSlider;
var default_operator;

/* Pagination */
var paginatorDiv = $('.page-selector');
var paginator = $('.pagesDropDown');
var currentPage;

$(document).ready(function() {
    /* Alternative to console.log for IE */
    if (!window.console) {
        console = {log: function() {
            }
        };
    }

    /* Adds a trim function to the String prototype */
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    /* Set default variables on document load */
    catBoxes = $('input:checkbox.cats');
    langBoxes = $('input:checkbox.langs');
    default_operator = $('input:checkbox.default_operator');
    slider = $('#slider-range');
    enableSlider = $('.enableSlider');
    paginatorDiv = $('.page-selector');
    paginator = $('.pagesDropDown');


    /* Action listener for the slider (onchange, enable/disable slider) */
    enableSlider.on('change', function(resp) {
        if (enableSlider.prop('checked')) {
            slider.slider('enable');
        } else {
            slider.slider('disable');
        }
    });

    /* Action listener for the paginator (onchange, show new results) */
    paginator.on('change', function(resp) {
        searchDatabaseNow(paginator.val());

    });

    /* Action listener for the window (on "Enter"-press, search) */
    $(window).keydown(function(event) {
        if (event.keyCode === 13) {
            searchDatabaseNow();
            event.preventDefault ? event.preventDefault() : event.returnValue = false;
            return false;
        }
    });
});

/**
 * Sets the minimum and maximum for the price slider.
 */
function setMinMaxSlider() {
    $.ajax({
        url: "init",
        type: 'POST',
        async: true,
        dataType: 'json',
        cache: false,
        beforeSend: function() {
            $("#spinner").show();
        },
        success: function(resp) {
            console.log("Success: ");
            console.log(resp);
            var min = resp['facets']['stat1']['min'];
            var max = resp['facets']['stat1']['max'];
            minPrice = min;
            maxPrice = max;
            slider.slider({
                range: true,
                min: min,
                max: max,
                values: [min, max],
                width: 500,
                slide: function(event, ui) {
                    minPrice = ui.values[0];
                    maxPrice = ui.values[1];
                    $('#amount').val('$' + ui.values[0] + " - $" + ui.values[1]);
                }
            });
            $("#amount").val("$" + $("#slider-range").slider("values", 0) +
                    " - $" + $("#slider-range").slider("values", 1));
            slider.slider('disable');
            $("#spinner").hide();
        },
        error: function(resp) {
            console.log("Error Message found: ");
            console.log(resp);
            $("#spinner").hide();
        }
    });
}

function getPriceRangeSearch() {
    var priceRange;
    if (enableSlider.prop('checked')) {
        priceRange = [minPrice, maxPrice];
    } else {
        priceRange = null;
    }
    return priceRange;
}

function getSearchOperator() {
    var operator = "AND";
    if ($('.default_operator').prop('checked')) {
        operator = "OR";
    }
    return operator;
}

function getKeywordSearch() {
    if (typeof $('#keywordSearch').val() !== 'undefined') {
        var keywords = $('#keywordSearch').val().trim();
        if (keywords.length < 1) {
            keywords = " ";
        }
    }
    return keywords;
}

function getURLSearch() {
    if (typeof $('#urlSearch').val() !== 'undefined') {
        var urls = $('#urlSearch').val().trim();
        if (urls.length < 1) {
            urls = " ";
        }
    }
    return urls;
}

/**
 * Retrieve the values from all fields and then search the database using an 
 * AJAX request.
 * 
 * @param {type} page
 * @returns {Boolean} false if no results/error
 */
function searchDatabaseNow(page) {
    currentPage = page;
    $('#results').css('display', 'none');
    $('.result').html("");

    var catOpts = getCatOpts();
    var langOpts = getLangOpts();
    var priceRange = getPriceRangeSearch();
    var keywords = getKeywordSearch();
    var urls = getURLSearch();
    var operator = getSearchOperator();

    var url = $('#roleVar').val() + '/search';
    $.ajax({
        url: url,
        type: 'POST',
        data: {url: urls, page: page, operator: operator, priceRange: priceRange, catOpts: catOpts, langOpts: langOpts, keywords: keywords},
        async: true,
        beforeSend: function() {
            $("#spinner").show();
        },
        dataType: 'json',
        success: function(resp) {
            parseSearchResponse(resp);
            $("#spinner").hide();
        },
        error: function(resp) {
            console.log(url);
            bootbox.alert("Could not find any results due to an error. Are you sure you disabled AdBlock or other anti-advertising-software? If you did, the cause might be on our side...");
            $("#spinner").hide();
        }
    });
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    return false;
}

/**
 * Converts an integer to a String (adding a leading 0 to numbers below 10). 
 * 
 * @param Integer integerToString
 * @returns String integerToString (changed)
 */
function addZero(integerToString) {
    if (integerToString < 10) {
        integerToString = "0" + integerToString;
    }
    return integerToString;
}

/**
 * Creates a dateString from a dateObject
 * 
 * @param DateObject date
 * @returns String dateString
 */
function createDateString(date) {
    var dateString = date.getDay() + "/"
            + date.getMonth() + "/"
            + date.getUTCFullYear()
            + " Time: " + addZero(date.getHours())
            + ":" + addZero(date.getMinutes())
            + ":" + addZero(date.getUTCSeconds());
    return dateString;
}

/**
 * Parses a JSON response into results, using another AJAX call returning 
 * a template filled with all results for a specific page.
 * 
 * @param JSON-String resp
 */
function parseSearchResponse(resp) {
    $('.result').html(""); //Clear results
    var resultCount = resp['hits']['total']; //Set resultCount

    /* Push results to an array */
    var results = [];
    $.each(resp['hits']['hits'], function(i, obj) {
        var result = new Object();

        var siteName = obj['_source']['name'];
        var siteUrl = obj['_source']['name'];
        var siteTags = obj['_source']['keywords'];
        var siteCreated = createDateString(new Date(obj['_source']['date_created']));
        var siteModified = createDateString(new Date(obj['_source']['date_modified']));
        var isOnline = "No";
        if (obj['_source']['is_online'] === 1) {
            isOnline = "Yes";
        }
        var lastOnlineCheck = createDateString(new Date(obj['_source']['last_online']));
        var siteName = siteName.split('.')[1];
        var imgUrl = "'/img/screenshots/" + siteName + ".png'";

        result.siteName = siteName;
        result.siteUrl = siteUrl;
        result.siteTags = siteTags;
        result.siteCreated = siteCreated;
        result.siteModified = siteModified;
        result.isOnline = isOnline;
        result.lastOnlineCheck = lastOnlineCheck;
        result.imgUrl = imgUrl;
        results.push(result);
    });

    /* If results were found, retrieve a template */
    if (results.length > 0) {
        $.ajax({
            url: '/search/results',
            type: 'POST',
            data: {
                results: results
            },
            success: function(resp) {
                $('.result').append(resp);
            },
            error: function(resp) {
                console.log("error");
                console.log(resp);
            }
        });
    }

    /* Show message if no results were found */
    if (resultCount === 0) {
        $('#resultCount').html("");
        $('.result').append("After a small search, no results were found...");
    } else {
        $('#resultCount').html("Results found: " + resultCount);
    }

    /* Animate to results */
    $('#results').css('display', 'block');
    if ($('html, body').is(':animated') === false) {
        $('html, body').animate({
            scrollTop: $('#results').position().top - 60
        }, 1300);
    }

    /* Instantiate paginator */
    var paginatorDiv = $('.page-selector');
    var paginator = $('.pagesDropDown');
    paginator.html("");

    /* Hide paginator if less than 10 results */
    if (resultCount < 1) {
        paginatorDiv.hide();
    } else {
        paginatorDiv.show();
    }
    /* Add amount of pages to paginator */
    var pages = resultCount / 10;
    var lastPageEmpty = false;
    if (resultCount % 10 === 0) {
        lastPageEmpty = true;
    }

    /* Populate page selector */
    for (var i = 0; i <= pages; i++) {
        if (lastPageEmpty === true) {
            if (i === (pages)) {
                break;
            }
        }
        paginator.append('<option value="' + (i + 1) + '">' + (i + 1) + '</option');
    }

    /* Set page selector to current page */
    if (currentPage) {
        paginator.val(currentPage);
    }
    $('#pageOf').html(" of " + Math.ceil(pages));
}

/**
 * Retrieve all selected categories
 * 
 * @returns Array catOpts
 */
function getCatOpts() {
    var catOpts = [];
    catBoxes.each(function() {
        if (this.checked) {
            catOpts.push(this.value);
        }
    });
    return catOpts;
}

/**
 * Retrieve all selected languages
 * 
 * @returns Array langOpts
 */
function getLangOpts() {
    var langOpts = [];
    langBoxes.each(function() {
        if (this.checked) {
            langOpts.push(this.value);
        }
    });
    return langOpts;
}

/**
 * Check all languages
 */
function checkLang() {
    langBoxes.each(function() {
        this.checked = true;
    });
}

/**
 * Uncheck all languages
 */
function uncheckLang() {
    langBoxes.each(function() {
        this.checked = false;
    });
}

/**
 * Check all categories
 */
function checkCat() {
    catBoxes.each(function() {
        this.checked = true;
    });
}

/**
 * Uncheck all categories
 */
function uncheckCat() {
    catBoxes.each(function() {
        this.checked = false;
    });
}
