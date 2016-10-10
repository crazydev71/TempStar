
TempStars.Pages.Dentist.JobCompleted = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'job-completed', function( page ) {
            // $$('#dentist-job-completed-paid-checkbox').on( 'change', paidToggleHandler );
            // $$('#dentist-job-completed-survey-checkbox').on( 'change', surveyToggleHandler );
            $$('#dentist-job-completed-notes-save-button').on( 'click', saveNotesHandler );
            $$('#dentist-job-completed-view-invoice-button').on( 'click', viewInvoiceHandler );
            $$('#dentist-job-completed-view-survey-button').on( 'click', viewSurveyHandler );
        });

        app.onPageBeforeRemove( 'job-completed', function( page ) {
            // $$('#dentist-job-completed-paid-checkbox').off( 'change', paidToggleHandler );
            // $$('#dentist-job-completed-survey-checkbox').off( 'change', surveyToggleHandler );
            $$('#dentist-job-completed-notes-save-button').off( 'click', saveNotesHandler );
            $$('#dentist-job-completed-view-invoice-button').off( 'click', viewInvoiceHandler );
            $$('#dentist-job-completed-view-survey-button').off( 'click', viewSurveyHandler );
        });
    }

    function saveNotesHandler( e ) {
        var jobId = $$(this).attr('data-id');
        var notes = $$('#dentist-job-completed-notes').val();

        TempStars.Api.updateJob( jobId, { dentistPrivateNotes: notes} )
        .then( function() {
            TempStars.Dentist.Router.goBackPage('home');
        })
        .catch( function( err ) {
            app.alert( 'Error saving notes. Please try again.' );
        });
    }

    function viewInvoiceHandler( e ) {
        var id = parseInt( $$(this).attr('data-id') );
        TempStars.Dentist.Router.goForwardPage( 'invoice', {}, job );
    }

    function viewSurveyHandler( e ) {
        app.modal({
          title:  'Rate your Hygienist',
          text: 'How happy would you be to have this hygienist work at your office again?',
          verticalButtons: true,
          buttons: [
            {
                text: 'Very Happy',
                onClick: function() {
                    app.alert('Great, they will be added to your favourites.', function() {
                        saveSurvey( TempStars.Rating.VERY_HAPPY );
                    });
                }
            },
            {
                text: 'Pleased',
                onClick: function() {
                    app.alert('Thanks, all set.', function() {
                        saveSurvey( TempStars.Rating.PLEASED );
                    });
                }
            },
            {
                text: 'No Thank You!',
                onClick: function() {
                    app.alert('Sorry, they will be added to your blocked list.', function() {
                        saveSurvey( TempStars.Rating.NO_THANK_YOU );
                    });
                }
            }
          ]
        });
    }

    function saveSurvey( result ) {
        TempStars.Api.saveHygienistRating( TempStars.User.getCurrentUser().dentistId, job.id, {hygienistRating: result} )
        .then( function() {
            TempStars.Dentist.Router.reloadPage('job-completed', { id: job.id } );
        });
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Dentist.getJob( params.id )
                    .then( function( job ) {
                        job.hasInvoice = (job.invoice) ? true : false;
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Dentist.getJobsByDate( params.date )
                    .then( function( jobs ) {
                        job = jobs[0];
                        job.hasInvoice = (job.invoice) ? true : false;
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }

            });
        }
    };

})();

TempStars.Pages.Dentist.JobCompleted.init();
