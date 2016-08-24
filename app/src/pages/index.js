var IndexPage = (function() {

    function init() {

        app.onPageInit( 'index', function( page ) {
            $$('#login-button').on( 'click', loginButtonHandler );
            $$('#login-form input').on( 'focus', removeError );
        }).trigger();

        app.onPageBeforeRemove( 'index', function( page ) {
            $$('#login-button').off( 'click', loginButtonHandler );
            $$('#login-form input').off( 'focus', removeError );
        });

    }

    function login() {
            userLoggedIn = true;
            isDentist = false;
            mainView.router.loadPage( { url: 'hygienist/hygienist.html', animatePages: false } );
            mainView.router.reloadPage( 'hygienist.html' );
            setupMenu();
    }

    function loginButtonHandler(e) {

        var constraints = {
            email: {
                presence: true,
                email: true
            },
            password: {
                presence: true,
            }
        };

        var formData = app.formToJSON('#login-form');
        var errors = validate(formData, constraints);
        if ( errors ) {
            if ( errors.email ) {
                $('#login-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            }
            if ( errors.password ) {
                $$('#login-form input[name="password"]').addClass('error').next().html( errors.password[0] );
            }
            return;
        }

        app.showPreloader('Logging In');
        setTimeout(function () {
            app.hidePreloader();
            login();
        }, 2000);

    }

    function removeError(e) {
        $$(this).removeClass( 'error' ).next().html( '' );
    }

    return {
        init: init
    };

})();

IndexPage.init();
