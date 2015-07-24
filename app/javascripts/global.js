$(document).ready(function() {
    $.getJSON('/users/userlist', function(data) {
        riot.mount('contact-list', {users: data});
    });
});

function getUserlist() {
    $.getJSON('/users/userlist', function(data) {
        return data;
    });
}