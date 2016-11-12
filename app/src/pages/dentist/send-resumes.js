
TempStars.Pages.Dentist.SendResumes = (function() {

    'use strict';

    function init() {

        app.onPageBeforeInit( 'send-resumes', function( page ) {

            $$('#dentist-send-resumes-button').on( 'click', sendResumesHandler );
            TempStars.Analytics.track( 'Viewed Hire Staff' );

        });
    }

    function sendResumesHandler( e ) {

        var constraints = {
            email: {
                presence: true,
                email: true
            },
            maxResumes: {
                presence: true,
                numericality: {
                    onlyInteger: true,
                    greaterThan: 0,
                    lessThanOrEqualTo: 10
                }
            }
        };

        // Clear errors
        $$('#dentist-send-resumes-form .form-error-msg').html('');
        $$('#dentist-send-resumes-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#dentist-send-resumes-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.email ) {
                $('#dentist-send-resumes-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            }
            if ( errors.maxResumes ) {
                $$('#dentist-send-resumes-form input[name="maxResumes"]').addClass('error').next().html( errors.maxResumes[0] );
            }
            return;
        }

        app.showPreloader('Sending Resumes');

        var dentistId = TempStars.User.getCurrentUser().dentistId;
        TempStars.Api.sendResumes( dentistId, formData )
        .then( function() {
            app.hidePreloader();
            TempStars.Dentist.Router.goBackPage();
            TempStars.Analytics.track( 'Sent Resumes' );
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error sending resumes. ' + err.error.message );
            TempStars.Dentist.Router.goBackPage();
        });

    }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.SendResumes.init();
