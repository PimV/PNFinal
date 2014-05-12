var pixelPrevValue;
var pixelUpdateInterval;

$(document).ready(function() {
    //getRealTimeValue($('#beacon_select').val());
//setInterval(function() {
    //    getRealTimeValue($('#beacon').val());
    //}, 10000);
    window.beforeunload = function() {
        if (pixelUpdateInterval) {
            clearInterval(pixelUpdateInterval);
        }
    };
});


function getRealTimeValue(beaconIds) {

    var start = new Date().getTime();
    var timeDifference;
    $.ajax({
        beforeSend: function() {
            console.log("Getting real-time-pixel-value: started!");
            $('#real-time-pixel-spinner').fadeTo(1000, '1.0');
        },
        url: '/application/api/pixel',
        method: 'GET',
        success: function(resp) {
            timeDifference = new Date().getTime() - start;
            if ($('#real-time-pixel-count').text().trim() === "0") {
                pixelPrevValue = resp;
                showRealTimePixelValue(resp);
                //$('#real-time-pixel-count').text(resp);
                return;
            }



            calculateMovingAverage(resp, timeDifference);
            //$('#real-time-pixel-count').text(resp);
        },
        error: function(resp) {
            timeDifference = new Date().getTime() - start;
            console.log(resp);
        },
        complete: function(resp) {
            $('#real-time-pixel-spinner').fadeTo(1000, '0');
            setTimeout(function() {
                getRealTimeValue(beaconIds);
            }, 10000 + timeDifference);
            console.log("Getting real-time-pixel-value: done!");
        }
    });
}

function calculateMovingAverage(newValue, timeDifference) {
    if (pixelUpdateInterval) {
        clearInterval(pixelUpdateInterval);
    }
    var secondsPerView = ((10000 + timeDifference) / 1000) / (newValue - pixelPrevValue);

    pixelUpdateInterval = setInterval(function() {
        showRealTimePixelValue();
    }, secondsPerView * 1000);
    pixelPrevValue = newValue;
}

function showRealTimePixelValue(value) {
    var newValue;
    if (value) {
        newValue = value;
    } else {
        newValue = parseInt($('#real-time-pixel-count').text().replace(/\./g, '')) + 1;
    }
    $('#real-time-pixel-count').text(formatNumber(parseInt(newValue)));
}
