
app.onPageBeforeInit( 'dentist-settings', function( page ) {
    $$('.dentist-settings-remove-blocked-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Blocked Hygienist', function() {
            app.alert( 'All set!' );
        });
    });

    $$('.dentist-settings-remove-fav-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Favourite Hygienist', function() {
            app.alert( 'All set!' );
        });
    });
});
