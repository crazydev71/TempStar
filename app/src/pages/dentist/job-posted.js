
TempStars.Pages.Dentist.JobPosted = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'dentist-job-posted', function( page ) {
            $$('#dentist-job-posted-cancel-button').show();
            $$('#dentist-job-posted-break-button').hide();

            $$('#dentist-job-posted-modify-button').on( 'click', modifyButtonHandler );
            $$('#dentist-job-posted-cancel-button').on( 'click', cancelButtonHandler );
            $$('#dentist-job-posted-break-button').on( 'click', breakButtonHandler );
            $$('#dentist-job-posted-save-button').on( 'click', saveButtonHandler );

            $$('#dentist-job-posted-remove-incentive-button').on( 'click', removeIncentiveButtonHandler );
            $$('#dentist-job-posted-offer-incentive-button').on( 'click', offerIncentiveButtonHandler );
            TempStars.Analytics.track( 'Viewed Posted Job' );

            updateCheckmark();
        });

        app.onPageBeforeRemove( 'dentist-job-posted', function( page ) {
            $$('#dentist-job-posted-modify-button').off( 'click', modifyButtonHandler );
            $$('#dentist-job-posted-cancel-button').off( 'click', cancelButtonHandler );
            $$('#dentist-job-posted-break-button').off( 'click', breakButtonHandler );
            $$('#dentist-job-posted-save-button').off( 'click', saveButtonHandler );

            $$('#dentist-job-posted-remove-incentive-button').off( 'click', removeIncentiveButtonHandler );
            $$('#dentist-job-posted-offer-incentive-button').off( 'click', offerIncentiveButtonHandler );
        });

        $$(document).on( 'click', '.dentist-job-posted-check-type .checkmark-row', checkmarkButtonHandler );
    }

    function removeIncentiveButtonHandler( e ) {
        if (e)
            e.preventDefault();
        app.modal({
          title:  'Remove Incentive',
          text: 'Removing your incentive bonus lowers the chance of a successful placement. Are you sure?',
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
        else {
            app.alert( 'Sorry no incentives apply to this job.' );
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
                TempStars.Dentist.Router.reloadPage('job-posted', {id: job.id});
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
        // $$('#dentist-job-posted-cancel-button').hide();
        // $$('#dentist-job-posted-break-button').show();
        app.modal({
          title:  'Cancel Job',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: cancelJob }
          ]
        });
    }

    function breakButtonHandler( e ) {
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

    function saveButtonHandler( e ) {
        e.preventDefault();

        app.showPreloader('Saving Changes');

        var dentistId = TempStars.User.getCurrentUser().dentistId;
        var data = {
            type: job.shifts[0].type
        };
        if (job.shifts[0].type === 2)
            data.bonus = 0;

        TempStars.Api.modifyJob( dentistId, job.id, data )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Modified Job' );
            app.modal({
                title:  'Changes Saved!',
                text: '',
                buttons: [
                    { text: 'OK', bold: true, onClick: function() {
                        TempStars.Dentist.Router.goBackPage('home');
                    }}
                ]
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error modifying job. Please try again.' );
        });
    }

    function checkmarkButtonHandler( e ) {
        var type = parseInt($$(this).attr('data-id'));
        job.shifts[0].type = type;

        updateCheckmark();
    }

    function updateCheckmark() {        
        if (job.shifts[0].type === 1) {
            $$('#dentist-job-posted-checkmark-1').css('background-image', "url('./img/radio-on.svg')");
            $$('#dentist-job-posted-checkmark-2').css('background-image', "url('./img/radio-off.svg')");
            $$('#dentist-job-posted-offer-incentive-wrapper').css('display', 'flex');
        }
        else if (job.shifts[0].type === 2) {
            $$('#dentist-job-posted-checkmark-1').css('background-image', "url('./img/radio-off.svg')");
            $$('#dentist-job-posted-checkmark-2').css('background-image', "url('./img/radio-on.svg')");
            $$('#dentist-job-posted-offer-incentive-wrapper').css('display', 'none');
        }
        else {
            $$('#dentist-job-posted-checkmark-1').css('background-image', "url('./img/radio-off.svg')");
            $$('#dentist-job-posted-checkmark-2').css('background-image', "url('./img/radio-off.svg')");
            $$('#dentist-job-posted-offer-incentive-wrapper').css('display', 'flex');
        }
    }

    function removeIncentive() {
        app.showPreloader('Removing Incentive');
        TempStars.Api.updateJob( job.id, {bonus:0, short:0, urgent:0, weekend:0})
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
                        if ( job.bonus ) {
                            job.hasBonus = true;
                        }
                        resolve( j );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else if (params.date) {
                    TempStars.Dentist.getJobsByDate( params.date )
                    .then( function( jobs ) {
                        job = jobs[0];
                        if ( job.bonus ) {
                            job.hasBonus = true;
                        }
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else
                    reslove( job );

            });
        }
    };

})();

TempStars.Pages.Dentist.JobPosted.init();
