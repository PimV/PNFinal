function updateCostPixelTable(data) {
    var budget = 15000;
    $.each(data, function(i, pixel) {
        $('#referers-table tr:last').after(
                '<tr>' +
                '<td>' + getBeaconById(parseFloat(data["flx_pixel_id"])) + '</td>' +
                '<td>' + formatNumber(parseFloat((budget / pixel["flx_pixels_sum"]) * 1000, 0)) + '</td>' +
                '<td>' + formatNumber(parseFloat(pixel["flx_pixels_sum"], 0)) + '</td>' +
                '<td>' + formatNumber(parseFloat(pixel["flx_form_field_click_sum"], 0)) + '</td>' +
                '<td>' + formatNumber(parseFloat(pixel["flx_time_on_site_avg"], 1)) + '</td>' +
                '</tr>');
    });
}