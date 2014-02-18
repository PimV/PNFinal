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
$(function() {
    if (!window.console)
        console = {log: function() {
            }};
    setMinMaxSlider();
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
        url: "search/init",
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

function searchDatabaseNow(show) {
    $('#results').css('display', 'none');
    console.log("Searching...");
    $('#results').css('display', 'none');
    $('.result').html("");
    var url = 'search/search';
    if (show === 'all') {
        $.ajax({
            url: url,
            type: 'POST',
            data: {showAll: true},
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
                console.log("Error: " + resp);
                $("#spinner").hide();
            }
        });
    } else {
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

        var keywords = $('.textSearch').val().trim();
        if (keywords.length < 1) {
            keywords = " ";
        }

        $.ajax({
            url: url,
            type: 'POST',
            data: {operator: operator, priceRange: priceRange, catOpts: catOpts, langOpts: langOpts, keywords: keywords},
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
                console.log(resp);
                $("#spinner").hide();
            }
        });
    }
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    return false;
}

function processRequestedESData(resp) {
    console.log("Received Data");
    $('.result').html("");
    var resultCount = 0;
    $.each(resp['hits']['hits'], function(i, obj) {
        siteHtml = '<div class="siteName">Name: ' + obj['_source']['name'] + '</a></div>';
        siteHtml += '<div class="siteUrl">Site URL: <a href="http://' + obj['_source']['url'] + '">' + obj['_source']['url'] + '</a></div>';
        siteHtml += '<div class="sitePrice">Price: $' + obj['_source']['price'] + '</div><br/>';
        $('.result').append(siteHtml);
        resultCount++;
    });
    if (resultCount === 0) {
        $('.result').append("After a small search, no results were found...");
    }
    $('#results').css('display', 'block');
    if ($('html, body').is(':animated') === false) {
        $('html, body').animate({
            scrollTop: $('#results').offset().top
        }, 800);
    }

}

function processRequestedData(resp) {
    $('.result').html("");
    var resultCount = 0;
    for (var i in resp) {
        resultCount++;
        siteHtml = '<div class="siteName">Name: ' + resp[i]['name'] + '</a></div>';
        siteHtml += '<div class="siteUrl">Site URL: <a href="http://' + resp[i]['url'] + '">' + resp[i]['url'] + '</a></div>';
        siteHtml += '<div class="sitePrice">Price: $' + resp[i]['price'] + '</div><br/>';
        $('.result').append(siteHtml);
    }
    if (resultCount === 0) {
        $('.result').append("After a small search, no results were found...");
    }
    $('#results').css('display', 'block');
    if ($('html, body').is(':animated') === false) {
        $('html, body').animate({
            scrollTop: $('#results').offset().top
        }, 800);
    }

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
