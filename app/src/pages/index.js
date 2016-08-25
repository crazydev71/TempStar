TempStars.Pages.Index = (function() {

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
        var errors = validate(formData, constraints );
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
        TempStars.Api.login( formData.email, formData.password )
        .then(function( results ) {
            app.hidePreloader();
            login();
        })
        .catch( function( error ) {
            app.hidePreloader();
            app.alert( 'login failed' );
        });
    }

    function removeError(e) {
        $$(this).removeClass( 'error' ).next().html( '' );
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


    return {
        init: init
    };

})();

TempStars.Pages.Index.init();
