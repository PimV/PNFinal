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
$(document).ready(function() {
    $('#menu-logout').on('click', function() {
        localStorage.clear();
    });

});