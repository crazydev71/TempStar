
TempStars.Pages.Dentist.JobPosted = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'dentist-job-posted', function( page ) {
            $$('#dentist-job-posted-modify-button').on( 'click', modifyButtonHandler );
            $$('#dentist-job-posted-cancel-button').on( 'click', cancelButtonHandler );
            $$('#dentist-job-posted-remove-incentive-button').on( 'click', removeIncentiveButtonHandler );
            $$('#dentist-job-posted-offer-incentive-button').on( 'click', offerIncentiveButtonHandler );
            TempStars.Analytics.track( 'Viewed Posted Job' );

        });

        app.onPageBeforeRemove( 'dentist-job-posted', function( page ) {
            $$('#dentist-job-posted-modify-button').off( 'click', modifyButtonHandler );
            $$('#dentist-job-posted-cancel-button').off( 'click', cancelButtonHandler );
            $$('#dentist-job-posted-remove-incentive-button').off( 'click', removeIncentiveButtonHandler );
            $$('#dentist-job-posted-offer-incentive-button').off( 'click', offerIncentiveButtonHandler );
        });
    }

    function removeIncentiveButtonHandler( e ) {
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

        TempStars.Job.checkIncentives( job, confirmOffer );
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
        else {
            app.alert( 'Sorry no incentives apply to this job.' );
        }
    }

    function addIncentive( data ) {
        app.showPreloader('Adding Incentive');
        TempStars.Api.updateJob( job.id, {short: data.short, urgent:data.urgent, weekend:data.weekend})
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Added Incentive' );
            TempStars.Dentist.Router.reloadPage('job-posted', {id: job.id});
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error adding incentive. Please try again.' );
        });
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        job.pageTitle = "Posted Job";
        TempStars.Dentist.Router.goForwardPage('modify-job', {}, job );
    }

    function cancelButtonHandler( e ) {
        e.preventDefault();
        app.modal({
          title:  'Cancel Job',
          text: 'Are you sure?',
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
        });
    }

    function removeIncentive() {
        app.showPreloader('Removing Incentive');
        TempStars.Api.updateJob( job.id, {short:0, urgent:0, weekend:0})
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Removed Incentive' );
            TempStars.Dentist.Router.reloadPage('job-posted', {id: job.id});
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error removing incentive. Please try again.' );
        });
    }

    function modifyJob() {
        console.log( 'modifying job');
    }

    // TODO
    function rateHygienist( result ) {
        TempStars.Api.updateJob( job.id, {hygienistRating: result} )
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
                    .then( function( j ) {
                        job = j;
                        if ( job.short || job.urgent || job.weekend ) {
                            job.hasIncentive = true;
                            job.incentive = TempStars.Job.getHourlyRateBoost( job );
                        }
                        resolve( j );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Dentist.getJobsByDate( params.date )
                    .then( function( jobs ) {
                        job = jobs[0];
                        if ( job.short || job.urgent || job.weekend ) {
                            job.hasIncentive = true;
                            job.incentive = TempStars.Job.getHourlyRateBoost( job );
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

TempStars.Pages.Dentist.JobPosted.init();
