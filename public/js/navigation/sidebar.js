var isVisible = false;
var isLocked = false;
$(document).ready(function() {
    init();
    $('#lockSidebar').on('click', function() {
        toggleLock();
    });
    $(window).on("mousemove", function(event) {
        if (isLocked === true) {
            return;
        }
        if (event.pageX < 150) {
            showSidebar();
        } else {
            hideSidebar();
        }
    });
});

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

function hideSidebar() {
    if (isVisible === true) {
        isVisible = false;
    }
//
    $('.wrapper').css("margin-left", "60px");
    $('#sidebar-wrapper').css("left", "0");
    $('.bottomSidebar').css("margin-left", "-150px");
    $('#sidebar-wrapper').css("margin-left", "-150px");
    $('.bottomSidebar').css("left", "0");

}

function lockSidebar() {
    isLocked = true;
    $('#lockIcon').attr('class', 'glyphicon glyphicon-ok');
    if (isVisible === false) {
        showSidebar();
    }
}

function unlockSidebar() {
    isLocked = false;
    $('#lockIcon').attr('class', '');
}

function toggleLock() {
    if (isLocked === false) {
        lockSidebar();
    } else {
        unlockSidebar();
    }
    localStorage['lock'] = isLocked;
}

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

function setWidgets() {
    setVisible();
    setLocked();
}

function setVisible() {
    if (isVisible === true) {
        showSidebar();
    } else {
        hideSidebar();
    }
}

function setLocked() {
    if (isLocked === true) {
        lockSidebar();
    } else {
        unlockSidebar();
    }
}

