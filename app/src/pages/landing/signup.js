
app.onPageInit( 'signup', function( page ) {
    mainView.showNavbar();
});


app.onPageInit( 'signup', function(page) {
    $$('#signup-button').off( 'click', signupButtonHandler );
    $$('#signup-button').on( 'click', signupButtonHandler );

    $$('#account-type-hygienist').on( 'change', function(e) {
        if ( $$(this).prop('checked') ) {
            $$('#account-type-dentist').prop('checked', false);
        }
    });
    $$('#account-type-dentist').on( 'change', function(e) {
        if ( $$(this).prop('checked') ) {
            $$('#account-type-hygienist').prop('checked', false);
        }
    });
});



function signupButtonHandler(e) {

    if ( $$('#account-type-hygienist').prop('checked') ) {
        mainView.router.loadPage( { url: 'landing/signup-hygienist.html' } );
    }
    else if ( $$('#account-type-dentist').prop('checked') ) {
        mainView.router.loadPage( { url: 'landing/signup-dentist.html' } );
    }
    else {
        app.alert( 'Please select hygienist or dentist to continue');
        e.preventDefault();
    }
}
