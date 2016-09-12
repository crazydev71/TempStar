TempStars.Pages.DentistSignup2 = (function() {
    var userAccount;
    var formData;
    var expDatePicker;

    function init() {

        app.onPageInit( 'dentist-signup2', function( page ) {
            $$('#dentist-signup2-done-button').on( 'click', doneButtonHandler );
            $$('#dentist-signup2-logout-link').on( 'click', logoutHandler );
            $$('#dentist-signup2-form input').on( 'keypress', keyHandler );
            mainView.showNavbar();
        });

        app.onPageBeforeRemove( 'dentist-signup2', function( page ) {
            $$('#dentist-signup2-done-button').off( 'click', doneButtonHandler );
            $$('#dentist-signup2-logout-link').off( 'click', logoutHandler );
            $$('#dentist-signup2-form input').off( 'keypress', keyHandler );
        });

        app.onPageBeforeAnimation( 'dentist-signup2', function( page ) {

            expDatePicker = app.picker({
                input: '#dentist-signup2-exp-date-field',
                rotateEffect: true,
                formatValue: function (p, values, displayValues) {
                    return values[0] + ' / ' + values[1];
                },
                cols: [ {
                    values: [ '01', '02', '03', '04', '05', '06',
                        '07', '08', '09', '10', '11', '12' ],
                    displayValues: [ '01 (Jan)', '02 (Feb)', '03 (March)', '04 (April)', '05 (May)', '06 (June)',
                        '07 (July)', '08 (Aug)', '09 (Sep)', '10 (Oct)', '11 (Nov)', '12 (Dec)']
                    },
                    {
                        divider: true,
                        content: '/'
                    },
                    {
                        values: [ '2016', '2017', '2018', '2019', '2020', '2021',
                            '2022', '2023', '2024', '2025' ]
                    }                ]
            });

            mainView.showNavbar();
        });
    }

    function doneButtonHandler( e ) {
        var expDate;

        var constraints = {
            cardholderName: {
                presence: true
            },
            cardNumber: {
                presence: true,
                creditCardNumber: true
            },
            expirationDate: {
                presence: true,
                creditCardExpiryDate: true,
            },
            securityCode: {
                presence: true,
                creditCardCVC: true
            }
        };

        // Clear errors
        $$('#dentist-signup2-form .form-error-msg').html('');
        $$('#dentist-signup2-form .field-error-msg').removeClass( 'error' ).html('');

        formData = {};
        formData.cardholderName = $$('#dentist-signup2-form input[data-stripe="name"]').val();
        formData.cardNumber = $$('#dentist-signup2-form input[data-stripe="number"]').val();
        formData.expirationDate = $$('#dentist-signup2-exp-date-field').val();
        formData.securityCode = $$('#dentist-signup2-form input[data-stripe="cvc"]').val();

        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.cardholderName ) {
                $('#dentist-signup2-form input[data-stripe="name"]').addClass('error').next().html( errors.cardholderName[0] );
            }
            if ( errors.cardNumber ) {
                $$('#dentist-signup2-form input[data-stripe="number"]').addClass('error').next().html( errors.cardNumber[0] );
            }
            if ( errors.expirationDate ) {
                $$('#dentist-signup2-form input[data-stripe="exp"]').addClass('error').next().html( errors.expirationDate[0] );
            }
            if ( errors.securityCode ) {
                $$('#dentist-signup2-form input[data-stripe="cvc"]').addClass('error').next().html( errors.securityCode[0] );
            }
            return;
        }

        var stripeData = {};
        stripeData.name = formData.cardholderName;
        stripeData.number = formData.cardNumber;
        stripeData.exp = formData.expirationDate;
        stripeData.cvc = formData.securityCode;
        Stripe.card.createToken( stripeData, stripeResponseHandler );

        // Go to the next page
        //mainView.router.loadPage( 'landing/dentist-signup3.html' );
    }

    function logoutHandler( e ) {
        app.confirm( 'Are you sure you want to log out?', function() {
            TempStars.User.logout()
            .then( function() {
                mainView.router.loadPage( { url: 'index.html', animatePages: false } );
            });
        });
    }

    function stripeResponseHandler( status, response ) {
        if ( response.error ) {
            app.alert( response.error.message );
        }
        else {
            var token = response.id;
            formData.token = token;
            app.formStoreData( 'dentist-signup2-form', formData );

            // Go to the next page
            mainView.router.loadPage( 'landing/dentist-signup3.html' );
        }
    }

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#dentist-signup2-done-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init
    };

})();

TempStars.Pages.DentistSignup2.init();
