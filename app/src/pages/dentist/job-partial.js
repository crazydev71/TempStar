
TempStars.Pages.Dentist.JobPartial = (function() {
    'use strict';

    var job;
    var initialized = false;

    function init() {

        if ( ! initialized ) {

            app.onPageBeforeInit( 'job-partial', function( page ) {
                $$('#dentist-job-partial-modify-button').on( 'click', modifyButtonHandler );
                $$('#dentist-job-partial-cancel-button').on( 'click', cancelButtonHandler );
                TempStars.Analytics.track( 'Viewed Partial Job' );
            });

            $$(document).on( 'click', '.dentist-partial-job-accept-button', acceptButtonHandler );
            $$(document).on( 'click', '.dentist-partial-job-reject-button', rejectButtonHandler );

            // app.onPageBeforeRemove( 'job-partial', function( page ) {
            //     $$('#dentist-job-partial-modify-button').off( 'click', modifyButtonHandler );
            //     $$('#dentist-job-partial-cancel-button').off( 'click', cancelButtonHandler );
            // });

            initialized = true;
        }
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        job.pageTitle = "Job with Partial Offers";
        TempStars.Dentist.Router.goForwardPage('modify-job', {}, job );
    }


    function cancelButtonHandler( e ) {
        e.preventDefault();

        var cancelMessage = 'Are you sure?<br><br>';

        if ( job.hygienist && job.hygienist.firstName ) {
            cancelMessage += job.hygienist.firstName + ' '
                            + job.hygienist.lastName
                            + ' will be notified.';
        }

        app.modal({
          title:  'Cancel Job',
          text: cancelMessage,
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: cancelJob }
          ]
        });
    }

    function cancelJob() {
        app.showPreloader('Cancelling Job');
        TempStars.Api.cancelJob( TempStars.User.getCurrentUser().dentistId, job.id )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Cancelled Job' );
            TempStars.Dentist.Router.goBackPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error cancelling job. Please try again.' );
            TempStars.Dentist.Router.reloadPage();
        });
    }

    function acceptButtonHandler( e ) {
        e.preventDefault();
        var poId = $$(this).attr('data-id');

        app.modal({
          title:  'Accept Offer',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: function() {
                  acceptJob( poId );
              }}
          ]
        });
    }

    function acceptJob( poId ) {

        app.showPreloader('Accepting Partial Offer');
        TempStars.Api.acceptPartialOffer( job.id, poId )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Accepted Partial Offer' );
            TempStars.Dentist.Router.goBackPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error accepting offer. Please try again.' );
            TempStars.Dentist.Router.reloadPage();
        });
    }

    function rejectButtonHandler( e ) {
        e.preventDefault();
        var poId = $$(this).attr('data-id');

        app.modal({
          title:  'Reject Offer',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: function() {
                  rejectJob( poId );
              }}
          ]
        });
    }

    function rejectJob( poId ) {

        app.showPreloader('Rejecting Partial Offer');
        TempStars.Api.rejectPartialOffer( job.id, poId )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Rejected Partial Offer' );
            TempStars.Dentist.Router.reloadPage( 'job-partial' );
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error rejecting offer. Please try again.' );
            TempStars.Dentist.Router.reloadPage();
        });
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Dentist.getJob( params.id )
                    .then( function( job ) {
                        // Filter out rejected partial jobs
                        //job.partialOffers = _(job.partialOffers).filter(['status', 0]).value();
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
                        job.partialOffers = _(job.partialOffers).filter(['status', 0]).value();
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

TempStars.Pages.Dentist.JobPartial.init();
