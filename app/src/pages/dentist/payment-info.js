TempStars.Pages.Dentist.PaymentInfo = (function() {
    var userAccount;
    var formData;
    var expDatePicker;

    function init() {

        app.onPageInit( 'dentist-payment-info', function( page ) {
            $$('#dentist-payment-info-done-button').on( 'click', doneButtonHandler );
            $$('#dentist-payment-info-form input').on( 'keypress', keyHandler );
            mainView.showNavbar();
            TempStars.Analytics.track( 'Viewed Dentist Payment Info' );
        });

        app.onPageBeforeRemove( 'dentist-payment-info', function( page ) {
            $$('#dentist-payment-info-done-button').off( 'click', doneButtonHandler );
            $$('#dentist-payment-info-form input').off( 'keypress', keyHandler );
        });

        app.onPageBeforeAnimation( 'dentist-payment-info', function( page ) {

            expDatePicker = app.picker({
                input: '#dentist-payment-info-exp-date-field',
                rotateEffect: false,
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
        $$('#dentist-payment-info-form .form-error-msg').html('');
        $$('#dentist-payment-info-form .field-error-msg').removeClass( 'error' ).html('');

        formData = {};
        formData.cardholderName = $$('#dentist-payment-info-form input[data-stripe="name"]').val();
        formData.cardNumber = $$('#dentist-payment-info-form input[data-stripe="number"]').val();
        if ( Template7.global.web ) {
            formData.expirationDate = $$('#dentist-payment-info-form select[data-stripe="exp_month"]').val() + '/' +
                                      $$('#dentist-payment-info-form select[data-stripe="exp_year"]').val();
        }
        else {
            formData.expirationDate = $$('#dentist-payment-info-exp-date-field').val();
        }
        formData.securityCode = $$('#dentist-payment-info-form input[data-stripe="cvc"]').val();

        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.cardholderName ) {
                $('#dentist-payment-info-form input[data-stripe="name"]').addClass('error').next().html( errors.cardholderName[0] );
            }
            if ( errors.cardNumber ) {
                $$('#dentist-payment-info-form input[data-stripe="number"]').addClass('error').next().html( errors.cardNumber[0] );
            }
            if ( errors.expirationDate ) {
                if ( Template7.global.web ) {
                    $$('#dentist-payment-info-exp-error-msg').addClass('error').html( errors.expirationDate[0] );
                }
                else {
                    $$('#dentist-payment-info-form input[data-stripe="exp"]').addClass('error').next().html( errors.expirationDate[0] );
                }
            }
            if ( errors.securityCode ) {
                $$('#dentist-payment-info-form input[data-stripe="cvc"]').addClass('error').next().html( errors.securityCode[0] );
            }
            return;
        }

        app.showPreloader('Saving Payment Info');

        var stripeData = {};
        stripeData.name = formData.cardholderName;
        stripeData.number = formData.cardNumber;
        stripeData.exp = formData.expirationDate;
        stripeData.cvc = formData.securityCode;
        Stripe.card.createToken( stripeData, stripeResponseHandler );
    }

    function stripeResponseHandler( status, response ) {
        if ( response.error ) {
            app.hidePreloader();
            app.alert( response.error.message );
        }
        else {
            app.hidePreloader();
            var token = response.id;
            TempStars.Dentist.addPaymentInfo( token )
            .then( function() {
                return TempStars.User.refresh();
            })
            .then( function() {
                TempStars.Dentist.Router.goForwardPage( 'post-job', {nohistory: true} );
            })
            .catch( function(err) {
                app.alert( err );
            });
        }
    }

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#dentist-payment-info-done-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.PaymentInfo.init();
