
        app.onPageInit( 'forgot-password', function( page ) {
            mainView.showNavbar();
        });

        app.onPageInit( 'forgot-password', function( page ) {
            $('#forgot-password-button').on( 'click', function(e) {
                $$('#forgot-password-status').show();
            })
            //mainView.showNavbar();
        });
