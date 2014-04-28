/*!
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

var isVisible = false;
var isLocked = false;
$(document).ready(function() {
    /* Initialize the sidebar */
    init();

    /* Action listener for the 'lock' link */
    $('#lockSidebar').on('click', function() {
        toggleLock();
    });

    /* Checks if the mouse is near/far away from the sidebar to show/hide it */
    var sideMargin;
    $(window).on("mousemove", function(event) {
        if (isLocked === true) {
            return;
        }
        sideMargin = 50;
        if (isVisible === true) {
            sideMargin = 250;
        }
        if (event.pageX < sideMargin) {
            showSidebar();
        } else {
            hideSidebar();
        }
    });
});

/**
 * Show the sidebar
 */
function showSidebar() {
    if (isVisible === false) {
        isVisible = true;
    }
    $('.wrapper').css("margin-left", "250px");
    $('#sidebar-wrapper').css("margin-left", "-250px");
    $('#sidebar-wrapper').css("left", "250px");
    $('.bottomSidebar').css("margin-left", "-250px");
    $('.bottomSidebar').css("left", "250px");

}

/**
 * Hide the sidebar
 */
function hideSidebar() {
    if (isVisible === true) {
        isVisible = false;
    }
    $('.wrapper').css("margin-left", "80px");
    $('#sidebar-wrapper').css("left", "0");
    $('.bottomSidebar').css("margin-left", "-150px");
    $('#sidebar-wrapper').css("margin-left", "-150px");
    $('.bottomSidebar').css("left", "0");

}

/**
 * Lock the sidebar
 */
function lockSidebar() {
    isLocked = true;
    $('#lockIcon').attr('class', 'glyphicon glyphicon-ok');
    if (isVisible === false) {
        showSidebar();
    }
}

/**
 * Unlock the sidebar
 */
function unlockSidebar() {
    isLocked = false;
    $('#lockIcon').attr('class', '');
}

/**
 * Toggles the sidebar lock
 */
function toggleLock() {
    if (isLocked === false) {
        lockSidebar();
    } else {
        unlockSidebar();
    }
    localStorage['lock'] = isLocked;
}

/**
 * Initialize the sidebar's values/settings
 */
function init() {
    if (localStorage['lock']) {
        if (localStorage['lock'] === 'true') {
            isLocked = true;
        } else {
            isLocked = false;
        }
    } else {
        isLocked = false;
    }
    setWidgets();
}

/**
 * (Re-)Set the variables on the sidebar (visible/locked)
 */
function setWidgets() {
    setVisible();
    setLocked();
}

/**
 * (Re-)Set the visibility of the sidebar
 */
function setVisible() {
    if (isVisible === true) {
        showSidebar();
    } else {
        hideSidebar();
    }
}

/**
 * (Re-)Set the lock of the sidebar
 */
function setLocked() {
    if (isLocked === true) {
        lockSidebar();
    } else {
        unlockSidebar();
    }
}

