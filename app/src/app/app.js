'use strict';

var userLoggedIn,
    isDentist;


        // If the user is already logged in, go directly to the main view
        if ( userLoggedIn ) {
            //$$('#landing-page').hide();
            //$$('#main-page').show();
            if ( isDentist ) {
                mainView.router.loadPage( { url: 'dentist.html', animatePages: false } );
            }
            else {
                mainView.router.loadPage( { url: 'hygienist.html', animatePages: false } );
            }
        }

function logout() {
    // Remove from local storage
    app.closePanel();
    userLoggedIn = false;
    isDentist = false;
    $$('.view-main').hide();
    $$('.view-landing').show();
    mainView.router.loadPage( { url: 'index.html', animatePages: false } );
}


    function setupMenu() {
        var menuContent;
        if ( isDentist ) {
            menuContent = $('#dentist-menu').html();
        }
        else {
            menuContent = $('#hygienist-menu').html();
        }
       $('#panel-menu').html(menuContent);

       $('.logout-link').on( 'click', function(e) {
           app.confirm( 'Are you sure you want to log out?', logout );
       });

    }
