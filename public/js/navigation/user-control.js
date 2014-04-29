/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

$(document).ready(function() {
    /* When clicked on logout, clear the JavaScript local storage */
    $('.logout').on('click', function() {
        localStorage.clear();
    });

    $('#roleBox').on('change', function() {
        switchRole();
    })
});

/**
 * Switch roles by sending an AJAX-request.
 */
function switchRole() {
    var newRole = $('#roleBox').val();
    $.ajax({
        url: '/user/role',
        method: 'POST',
        data: {newRole: newRole},
        success: function(resp) {
            window.location.href = "/user/role";
        }
    });
}
