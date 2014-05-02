$(document).ready(function() {
    var tabTitle = $("#tab_title"),
            tabContent = $("#tab_content"),
            tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
            tabCounter = 3,
            customGroupTable = $('#custom-group-table');

    var tabs = $("#per-site-tabs").tabs();

    // modal dialog init: custom buttons and a "close" callback resetting the form inside
    var dialog = $("#dialog").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            Add: function() {
                addTab();
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            form[ 0 ].reset();
        }
    });

    // addTab form: calls addTab function on submit and closes the dialog
    var form = dialog.find("form").submit(function(event) {
        addTab();
        dialog.dialog("close");
        event.preventDefault();
    });

    // actual addTab function: adds new tab using the input from the form above
    function addTab(uniqueUsers, views, formClicks, avgTime) {
        var table = $('#table_group').val();
        
        var label = $("#tab_title").val();
        var groupType = 0;
        var uniqueUsers = 0;
        var views = 0;
        var formClicks = 0;
        var avgTime = 0;

        var uniqueUserAdd;
        var viewsAdd;
        var formClicksAdd;
        var avgTimeAdd;

        var groupEntityCount = 0;
        $('#' + table + '-table tr:gt(0) input[type="checkbox"]:checked').each(function() {
            groupEntityCount++;
            var row = $(this).parent().parent();
            var rowcells = row.find('td');

            uniqueUserAdd = parseFloat($(rowcells[2]).text().replace(/\./g, ''));
            console.log(uniqueUserAdd);
            if (!isNaN(uniqueUserAdd)) {
                uniqueUsers += uniqueUserAdd;
            }

            viewsAdd = parseFloat($(rowcells[3]).text().replace(/\./g, ''));
            if (!isNaN(viewsAdd)) {
                views += viewsAdd;
            }

            formClicksAdd = parseFloat($(rowcells[4]).text().replace(/\./g, ''));
            if (!isNaN(formClicksAdd)) {
                formClicks += formClicksAdd;
            }
            avgTimeAdd = parseFloat($(rowcells[5]).text().replace(/\./g, ''));
            if (!isNaN(avgTimeAdd)) {
                avgTime += avgTimeAdd;
            }
        });
        if (groupEntityCount < 1) {
            return;
        }
        groupType = table;

        /* Calculate Average for avgTime */
        avgTime = avgTime / groupEntityCount;
        avgTime = avgTime.toFixed(1);

        uniqueUsers = parseFloat(uniqueUsers);
        views = parseFloat(views);
        formClicks = parseFloat(formClicks);
        $('#custom-group-table tr:last').after(
                '<tr>' +
                '<td>' + label + '</td>' +
                '<td>' + groupType + '</td>' +
                '<td>' + formatNumber(uniqueUsers, 0) + '</td>' +
                '<td>' + formatNumber(views, 0) + '</td>' +
                '<td>' + formatNumber(formClicks, 0) + '</td>' +
                '<td>' + avgTime + '</td>' +
                '</tr>');
    }

    // addTab button: just opens the dialog
    $("#add_tab")
            .click(function() {
                dialog.dialog("open");
            });

    // close icon: removing the tab on click
    tabs.delegate("span.ui-icon-close", "click", function() {
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        tabs.tabs("refresh");
    });

    tabs.bind("keyup", function(event) {
        if (event.altKey && event.keyCode === $.ui.keyCode.BACKSPACE) {
            var panelId = tabs.find(".ui-tabs-active").remove().attr("aria-controls");
            $("#" + panelId).remove();
            tabs.tabs("refresh");
        }
    });
});