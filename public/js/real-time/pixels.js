var new_value;
var previous_value;
var dynamic_value = 0;
var increment_step;
var values = [];
var set_interval = 5;
var timer_interval = 50;
var processing_time;
var isRunning = false;

$(document).ready(function() {
    console.log("HOI");
});

var timerVal = setInterval(timer, timer_interval);

function getAvg() {
    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        sum += parseFloat(values[i]);
    }
    var avg = sum / values.length;
    return avg;
}

function addToAvgArray(value) {
    if (values.length > 10) {
        values.pop();
        values.unshift(value);
    } else {
        values.push(value);
    }
}

function timer() {
    var time_interval = (set_interval + processing_time);
    var multiplier = timer_interval / 500;
    increment_step = (new_value / getAvg()) / time_interval;


    // console.log("Inter-incr-step: " + increment_step);
    var newvalmindynval = new_value - dynamic_value;
    var dyn_val = (new_value - dynamic_value) / time_interval;
    if (dyn_val.toFixed(2) > -0.25) {
        //console.log("Dyn Value = " + dyn_val);
        increment_step += dyn_val;
    } else {
        increment_step += -0.25;
    }

    if (increment_step < 0.02) {
        increment_step = 0.02;
    }
    increment_step = increment_step * multiplier;//* (newvalmindynval / increment_step);

    var new_dynamic_value = (+dynamic_value + +increment_step);
    if (new_dynamic_value > dynamic_value) {
        dynamic_value = new_dynamic_value;
    }


    if (!isNaN(dynamic_value.toFixed(3))) {
        if (dynamic_value == 0) {
            $('#pixel_count').text("Loading data...");
        } else {
            $('#pixel_count').text((commaSeparateNumber(parseFloat(Math.round(dynamic_value * 1000) / 1000).toFixed(3) + '').replace('.', ',')));
        }

    }
}
function commaSeparateNumber(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + '.' + '$2');
    }
    return val;
}

//Initialize AJAX calls
setTimeout(refresh1, 0);

function refresh1() {
    if (isRunning == false) {
        isRunning = true;
        var start = new Date().getTime();
        $.ajax({
            url: '/application/api/pixel',
            method: 'GET',
            success: function(resp) {

                new_value = parseFloat(resp);
                if (!isNaN(new_value)) {

                    if (!dynamic_value) {
                        dynamic_value = new_value;
                    }
                    addToAvgArray(new_value);
                    //processing_time = (new Date().getTime() - start) / 1000;

                    previous_value = new_value;
                } else {
                    if (previous_value) {
                        new_value = previous_value;
                    } else {
                        new_value = 0;
                    }
                }
            },
            error: function(resp) {
                console.log(resp);
            },
            complete: function() {
                isRunning = false;
                processing_time = (new Date().getTime() - start) / 1000;
                setTimeout(refresh1, ((+processing_time - +set_interval) * 1000) / 2);
            }
        });
    }
}