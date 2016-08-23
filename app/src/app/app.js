'use strict';

var userLoggedIn,
    isDentist;

app.onPageInit( 'index', function( page ) {
    //mainView.hideNavbar();
    $('#login-button').on( 'click', function(e) {
        userLoggedIn = true;
        isDentist = false;
        mainView.router.loadPage( { url: 'hygienist/hygienist.html', animatePages: false } );
        mainView.router.reloadPage( 'hygienist.html' );
        setupMenu();
    });

});

// If the user is already logged in, go directly to the main view
if ( userLoggedIn ) {
    $$('#landing-page').hide();
    //$$('#main-page').show();
    if ( isDentist ) {
        mainView.router.loadPage( { url: 'dentist.html', animatePages: false } );
    }
    else {
        mainView.router.loadPage( { url: 'hygienist.html', animatePages: false } );
    }
    setupMenu();
}



//
// app.onPageInit( 'landing', function( page ) {
//     //landingView.hideNavbar();
// });


// app.onPageBeforeInit( 'login', function( page ) {
//     landingView.showNavbar();
// });
//
// app.onPageBeforeInit( 'signup', function( page ) {
//     landingView.showNavbar();
// });



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



function logout() {
    // Remove from local storage
    app.closePanel();
    userLoggedIn = false;
    isDentist = false;
    $$('.view-main').hide();
    $$('.view-landing').show();
    landingView.router.loadPage( { url: 'landing/login.html', animatePages: false } );
}

function setupListeners() {

}
