
TempStars.Pages.Hygienist.JobCompleted = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'job-completed', function( page ) {
            $$('#hygienist-job-completed-notes-save-button').on( 'click', saveNotesHandler );
            $$('#hygienist-job-completed-view-invoice-button').on( 'click', viewInvoiceHandler );
            $$('#hygienist-job-completed-view-survey-button').on( 'click', surveyButtonHandler );
            $$('#hygienist-job-completed-invoice-button').on( 'click', invoiceButtonHandler );
            TempStars.Analytics.track( 'Viewed Completed Job' );

        });

        app.onPageBeforeRemove( 'job-completed', function( page ) {
            $$('#hygienist-job-completed-notes-save-button').off( 'click', saveNotesHandler );
            $$('#hygienist-job-completed-view-invoice-button').off( 'click', viewInvoiceHandler );
            $$('#hygienist-job-completed-view-survey-button').off( 'click', surveyButtonHandler );
            $$('#hygienist-job-completed-invoice-button').off( 'click', invoiceButtonHandler );
        });
    }

    function invoiceButtonHandler( e ) {
        if ( job.invoice ) {
            TempStars.Hygienist.Router.goForwardPage( 'invoice', {}, job );
        }
        else {
            TempStars.Hygienist.Router.goForwardPage( 'create-invoice', {}, job );
        }
    }

    function saveNotesHandler( e ) {
        e.preventDefault();

        var jobId = $$(this).attr('data-id');
        var notes = $$('#hygienist-job-completed-notes').val();

        app.showPreloader('Saving Notes');
        TempStars.Api.updateJob( jobId, { hygienistPrivateNotes: notes} )
        .then( function() {
            app.hidePreloader();
            TempStars.Hygienist.Router.goBackPage('home');
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error saving notes. Please try again.' );
        });
    }


    function viewInvoiceHandler( e ) {
        var id = parseInt( $$(this).attr('data-id') );
        TempStars.Hygienist.Router.goForwardPage( 'invoice', {}, job );
    }

    function surveyButtonHandler( e ) {
        e.preventDefault();
        TempStars.Hygienist.surveyButtonHandler( e, job.id );
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Api.getHygienistJob( TempStars.User.getCurrentUser().hygienistId, params.id )
                    .then( function( job ) {
                        job.hasInvoice = (job.invoice) ? true : false;
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Hygienist.getJobsByDate( params.date )
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

TempStars.Pages.Hygienist.JobCompleted.init();
