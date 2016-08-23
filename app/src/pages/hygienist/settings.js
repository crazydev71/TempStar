

app.onPageBeforeInit( 'settings', function( page ) {
    $$('.settings-remove-blocked-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Blocked Office', function() {
            app.alert( 'All set!' );
        });
    });

    $$('.settings-remove-fav-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Favourite Office', function() {
            app.alert( 'All set!' );
        });
    });
});
