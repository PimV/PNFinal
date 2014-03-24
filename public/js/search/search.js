//Filter boxes
var catBoxes = $('input:checkbox.cats');
var langBoxes = $('input:checkbox.langs');
//Slider
var minPrice;
var maxPrice;
var slider;
//Other filter buttons;
var enableSlider;
var default_operator;
//Pagination
var paginatorDiv = $('.page-selector');
var paginator = $('.pagesDropDown');
var currentPage;
$(function() {
    if (!window.console)
        console = {log: function() {
            }
        };
});
$(document).ready(function() {

    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    catBoxes = $('input:checkbox.cats');
    langBoxes = $('input:checkbox.langs');
    default_operator = $('input:checkbox.default_operator');
    slider = $('#slider-range');
    enableSlider = $('.enableSlider');
    paginatorDiv = $('.page-selector');
    paginator = $('.pagesDropDown');
    /**
     * Event listeners
     */
    enableSlider.on('change', function(resp) {
        if (enableSlider.prop('checked')) {
            slider.slider('enable');
        } else {
            slider.slider('disable');
        }
    });
    paginator.on('change', function(resp) {
        //Show new results 
        searchDatabaseNow(paginator.val());

    });
});
$(window).keydown(function(event) {
    if (event.keyCode === 13) {
        searchDatabaseNow();
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
        return false;
    }
});
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

function searchDatabaseNow(page) {
    currentPage = page;
    $('#results').css('display', 'none');
    $('.result').html("");
    var url = $('#roleVar').val() + '/search';
    var priceRange;
    if (enableSlider.prop('checked')) {
        priceRange = [minPrice, maxPrice];
    } else {
        priceRange = null;
    }

    var operator = "AND";
    if ($('.default_operator').prop('checked')) {
        operator = "OR";
    }

    var catOpts = getCatOpts();
    var langOpts = getLangOpts();
    if (typeof $('#keywordSearch').val() !== 'undefined') {
        var keywords = $('#keywordSearch').val().trim();
        if (keywords.length < 1) {
            keywords = " ";
        }
    }
    if (typeof $('#urlSearch').val() !== 'undefined') {
        var urls = $('#urlSearch').val().trim();
        if (urls.length < 1) {
            urls = " ";
        }
    }

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
            processRequestedESData(resp);
            $("#spinner").hide();
        },
        error: function(resp) {
            bootbox.alert("Could not find any results due to an error. Are you sure you disabled AdBlock or other advertising-software? If you did, the cause might be on our side...");
            $("#spinner").hide();
        }
    });
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    return false;
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function createDateString(date) {
    var dateString = date.getDay() + "/"
            + date.getMonth() + "/"
            + date.getUTCFullYear()
            + " Time: " + addZero(date.getHours())
            + ":" + addZero(date.getMinutes())
            + ":" + addZero(date.getUTCSeconds());
    return dateString;
}

function processRequestedESData(resp) {
    $('.result').html(""); //Clear results
    var resultCount = resp['hits']['total']; //Set resultCount

    var results = [];
    //Show all results
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
    //Show message if no results were found
    if (resultCount === 0) {
        $('#resultCount').html("");
        $('.result').append("After a small search, no results were found...");
    } else {
        $('#resultCount').html("Results found: " + resultCount);
    }
    //Animate to results
    $('#results').css('display', 'block');
    if ($('html, body').is(':animated') === false) {
        $('html, body').animate({
            scrollTop: $('#results').position().top - 60
        }, 1300);
    }
    //Instantiate paginator
    var paginatorDiv = $('.page-selector');
    var paginator = $('.pagesDropDown');
    paginator.html("");
    //Hide paginator if less than 10 results
    if (resultCount < 1) {
        paginatorDiv.hide();
    } else {
        paginatorDiv.show();
    }
    //Add amount of pages to paginator
    var pages = resultCount / 10;
    var lastPageEmpty = false;
    if (resultCount % 10 === 0) {
        lastPageEmpty = true;

    }

    //Populate page selector
    for (var i = 0; i <= pages; i++) {
        if (lastPageEmpty === true) {
            if (i === (pages)) {
                break;
            }
        }
        paginator.append('<option value="' + (i + 1) + '">' + (i + 1) + '</option');
    }

    //Set page selector to current page
    if (currentPage) {
        paginator.val(currentPage);
    }
    $('#pageOf').html(" of " + Math.ceil(pages));
}


function getCatOpts() {
    var catOpts = [];
    catBoxes.each(function() {
        if (this.checked) {
            catOpts.push(this.value);
        }
    });
    return catOpts;
}

function getLangOpts() {
    var langOpts = [];
    langBoxes.each(function() {
        if (this.checked) {
            langOpts.push(this.value);
        }
    });
    return langOpts;
}

function checkLang() {
    langBoxes.each(function() {
        this.checked = true;
    });
}

function uncheckLang() {
    langBoxes.each(function() {
        this.checked = false;
    });
}

function checkCat() {
    catBoxes.each(function() {
        this.checked = true;
    });
}

function uncheckCat() {
    catBoxes.each(function() {
        this.checked = false;
    });
}
