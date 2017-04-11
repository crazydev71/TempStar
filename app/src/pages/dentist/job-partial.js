
TempStars.Pages.Dentist.JobPartial = (function() {
    'use strict';

    var job;
    var initialized = false;

    function init() {

        if ( ! initialized ) {

            app.onPageBeforeInit( 'dentist-job-partial', function( page ) {
                $$('#dentist-job-partial-modify-button').on( 'click', modifyButtonHandler );
                $$('#dentist-job-partial-cancel-button').on( 'click', cancelButtonHandler );
                $$('#dentist-job-partial-remove-incentive-button').on( 'click', removeIncentiveButtonHandler );
                $$('#dentist-job-partial-offer-incentive-button').on( 'click', offerIncentiveButtonHandler );

                TempStars.Analytics.track( 'Viewed Partial Job' );

                _.map( page.context.partialOffers, function( po ) {
                    var ratingId = '#hygienist-rating-' +  po.id;
                    $( ratingId ).starRating({
                        starSize: 16,
                        activeColor: 'gold',
                        initialRating: po.hygienist.starScore,
                        readOnly: true,
                        useGradient: false
                    });
                });
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

    function removeIncentiveButtonHandler( e ) {
        if (e)
            e.preventDefault();
        app.modal({
          title:  'Remove Incentive',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: removeIncentive }
          ]
        });
    }

    function offerIncentiveButtonHandler( e ) {
        e.preventDefault();
        job.postedStart = moment.utc( job.shifts[0].postedStart ).local().format('h:mm a');
        job.postedEnd = moment.utc( job.shifts[0].postedEnd ).local().format('h:mm a');
        TempStars.Job.offerIncentives( addManualIncentive );
    }

    function confirmOffer( data ) {
        var text;

        var boost = TempStars.Job.getHourlyRateBoost( data );
        if ( boost > 0 ) {
            text = 'Add +$' + boost + '/hr incentive bonus?';

            app.confirm( text, 'Offer Incentive?', function() {
                addIncentive( data );
            });
        }
    }

    function addManualIncentive( bonus ) {
        if (bonus === '0') {
            removeIncentiveButtonHandler(null);
        }
        else {
            app.showPreloader('Adding Incentive');
            TempStars.Api.updateJob( job.id, {bonus: bonus})
            .then( function() {
                app.hidePreloader();
                TempStars.Analytics.track( 'Added Incentive' );
                TempStars.Dentist.Router.reloadPage('job-partial', {id: job.id});
            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert( 'Error adding incentive. Please try again.' );
            });
        }
    }

    function addIncentive( data ) {
        app.showPreloader('Adding Incentive');
        TempStars.Api.updateJob( job.id, {short: data.short, urgent:data.urgent, weekend:data.weekend})
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Added Incentive' );
            TempStars.Dentist.Router.reloadPage('job-partial', {id: job.id});
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error adding incentive. Please try again.' );
        });
    }

    function removeIncentive() {
        app.showPreloader('Removing Incentive');
        TempStars.Api.updateJob( job.id, {bonus:0, short:0, urgent:0, weekend:0})
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Removed Incentive' );
            TempStars.Dentist.Router.reloadPage('job-partial', {id: job.id});
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error removing incentive. Please try again.' );
        });
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
                        if ( job.bonus ) {
                            job.hasBonus = true;
                        }
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
                        // Filter out rejected partial jobs
                        job.partialOffers = _(job.partialOffers).filter(['status', 0]).value();
                        if ( job.bonus ) {
                            job.hasBonus = true;
                        }
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
