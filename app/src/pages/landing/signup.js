var Signup = (function() {

app.onPageInit( 'signup', function( page ) {
    mainView.showNavbar();

    $$('#signup-button').on( 'click', signupButtonHandler );
    $$('#account-type-hygienist').on( 'change', toggleHygienist );
    $$('#account-type-dentist').on( 'change', toggleDentist );
    $$('#signup input').on( 'focus', removeError );
});

app.onPageBeforeRemove( 'signup', function( page ) {
    $$('#signup-button').off( 'click', signupButtonHandler );
    $$('#account-type-hygienist').off( 'change', toggleHygienist );
    $$('#account-type-dentist').off( 'change', toggleDentist );
    $$('#signup input').off( 'focus', removeError );
});

function signupButtonHandler(e) {

    var constraints = {
        email: {
            presence: true,
            email: true
        },
        password: {
            presence: true,
            length: {
                minimum: 6
            }
        }
    };

    var formData = app.formToJSON('#signup');
    var errors = validate(formData, constraints);
    if ( errors ) {
        if ( errors.email ) {
            $('#signup input[name="email"]').addClass('error').next().html( errors.email[0] );
        }
        if ( errors.password ) {
            $$('#signup input[name="password"]').addClass('error').next().html( errors.password[0] );
        }
        return;
    }

    app.showPreloader('Creating Account');
    setTimeout(function () {
        app.hidePreloader();
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

    }, 2000);


}

function toggleHygienist(e) {
    if ( $$(this).prop('checked') ) {
        $$('#account-type-dentist').prop('checked', false);
    }
}

function toggleDentist(e) {
    if ( $$(this).prop('checked') ) {
        $$('#account-type-hygienist').prop('checked', false);
    }
}

function removeError(e) {
    $$(this).removeClass( 'error' ).next().html( '' );
}

})();
