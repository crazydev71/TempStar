
TempStars.Pages.Dentist.JobPartialDetails = (function() {
    'use strict';

    var job;
    var interval;

    function init() {
        app.onPageBeforeInit( 'dentist-job-partial-details', function( page ) {
            job = page.context;

            if ( job.selOffer.hygienist.photoUrl ) {
                $$('#hygienist-profile-photo').attr('src', job.selOffer.hygienist.photoUrl);
            }

            $$('#dentist-job-partial-details-accept-button').on( 'click', acceptButtonHandler );
            $$('#dentist-job-partial-details-decline-button').on( 'click', declineButtonHandler );
            $$('#dentist-job-partial-details-view-resume').on( 'click', resumeButtonHandler );

            $('#hygienist-rating').starRating({
                starSize: 20,
                activeColor: 'gold',
                initialRating: job.selOffer.hygienist.starScore,
                readOnly: true,
                useGradient: false
            });

            TempStars.Analytics.track( 'Viewed Custom Offer Details' );

            refreshExpireTime();
            interval = setInterval( refreshExpireTime, 60000 );
        });

        app.onPageBeforeRemove( 'dentist-job-partial-details', function( page ) {
            $$('#dentist-job-partial-details-accept-button').off( 'click', acceptButtonHandler );
            $$('#dentist-job-partial-details-decline-button').off( 'click', declineButtonHandler );
            $$('#dentist-job-partial-details-view-resume').off( 'click', resumeButtonHandler );

            clearInterval( interval );
        });
    }

    function refreshExpireTime() {
        var createdTime = job.selOffer.createdOn;
        var curDate = new Date();
        var duration = moment.utc(createdTime).add(TempStars.App.getExpiryPeriod(), 'hour').valueOf() - moment.utc(curDate).valueOf();

        if (duration < 0) {
            $$('#dentist-job-partial-details-expire-time').html("This Custom Offer was expired");
            return;
        }

        var hh = parseInt(duration / 3600000);
        var mm = parseInt((duration - hh * 3600000) / 60000);
        var expireTime = '';

        if (hh === 0)
            expireTime = mm + 'min';
        else if (hh === 1)
            expireTime = hh + 'hr ' + mm + 'min';
        else
            expireTime = hh + 'hrs ' + mm + 'min';

        $$('#dentist-job-partial-details-expire-time').html("This Custom Offer expires in: " + expireTime + " or less");
    }

    function acceptButtonHandler( e ) {
        e.preventDefault();
        var poId = job.selOffer.id;
        var text = '';

        text = job.selOffer.hygienist.firstName + ' ' + job.selOffer.hygienist.lastName + '<br><br>' +
               moment( job.selOffer.offeredStartTime ).local().format('ddd, MMM D') + '<br>' +
               moment.utc( job.selOffer.offeredStartTime ).local().format('h:mm a') + ' - ' +
               moment.utc( job.selOffer.offeredEndTime ).local().format('h:mm a') + '<br><br>' +
               'Rate: $' + job.selOffer.hourlyRate + '/hr' + '<br><br>' +
               'By accepting, you are booking and confirming this hygienist for this shift at the specified hours and rate.';

        app.modal({
          title:  'Accept and Book This Offer?',
          text: text,
          buttons: [
              { text: 'I Accept', bold: true, onClick: function() {
                  acceptJob( poId );
              }},
              { text: 'Cancel' }
          ]
        });
    }

    function acceptJob( poId ) {

        app.showPreloader('Accepting Custom Offer');
        TempStars.Api.acceptPartialOffer( job.id, poId )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Accepted Custom Offer' );

            app.modal({
                title:  'Booked and Confirmed',
                text: "This hygienist is now booked and confirmed for this job.<br>You don’t have to do anything else.",
                buttons: [
                    { text: 'OK', bold: true, onClick: function() {
                        TempStars.Dentist.Router.goBackPage('home');
                    }}
                ]
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error accepting offer. Please try again.' );
        });
    }

    function declineButtonHandler( e ) {
        e.preventDefault();
        var poId = job.selOffer.id;

        app.modal({
          title: 'Decline this Offer?',
          text: '',
          buttons: [
                { text: 'Decline', bold: true, onClick: function() {
                    declineJob( poId );
                }},
                { text: 'Cancel' }
          ]
        });
    }

    function declineJob( poId ) {

        app.showPreloader('Declining Custom Offer');
        TempStars.Api.rejectPartialOffer( job.id, poId )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Declined Custom Offer' );

            app.modal({
                title:  'Custom Offer Removed',
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
            app.alert( 'Error declining offer. Please try again.' );
        });
    }

    function resumeButtonHandler( e ) {
        e.preventDefault();

        var text = "";
        text = "Most resume files are directly viewable on mobiles, tablets and computers. If you can’t directly view the resume, the file will need to be downloaded and viewed on your desktop computer.";

        app.modal({
            title:  "",
            text: text,
            buttons: [
                { text: 'Got it!', bold: true, onClick: function() {
                    window.open(job.selOffer.hygienist.resumeUrl, '_system');
                }}
            ]
        });
     }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.JobPartialDetails.init();
