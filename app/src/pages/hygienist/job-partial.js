
TempStars.Pages.Hygienist.JobPartial = (function() {
    'use strict';

    var job;
    var interval;

    function init() {

        app.onPageBeforeInit( 'hygienist-job-partial', function( page ) {
            TempStars.Analytics.track( 'Viewed Custom Job Details' );
            $$('#hygienist-job-partial-modify-button').on( 'click', modifyButtonHandler );
            $$('#hygienist-job-partial-cancel-button').on( 'click', cancelButtonHandler );

            refreshExpireTime();
            interval = setInterval( refreshExpireTime, 60000 );
        });

        app.onPageBeforeRemove( 'hygienist-job-partial', function( page ) {
            $$('#hygienist-job-partial-modify-button').off( 'click', modifyButtonHandler );
            $$('#hygienist-job-partial-cancel-button').off( 'click', cancelButtonHandler );

            clearInterval( interval );
        });
    }

    function refreshExpireTime() {
        var createdTime = job.partialOffers[0].createdOn;
        var curDate = new Date();
        var duration = moment.utc(createdTime).add(14, 'hour').valueOf() - moment.utc(curDate).valueOf();

        if (duration < 0)
            return;

        var hh = parseInt(duration / 3600000);
        var mm = parseInt((duration - hh * 3600000) / 60000);
        var expireTime = '';

        if (hh === 0)
            expireTime = mm + 'min';
        else if (hh === 1)
            expireTime = hh + 'hr ' + mm + 'min';
        else
            expireTime = hh + 'hrs ' + mm + 'min';

        $$('#hygienist-job-partial-expire-time').html('This offer will expire in: ' + expireTime);
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        var po = job.partialOffers[0];
        po.startDate = job.startDate;
        po.jobId = job.id;
        po.postedStart = job.shifts[0].postedStart;
        po.postedEnd = job.shifts[0].postedEnd;
        TempStars.Hygienist.Router.goForwardPage('modify-partial-offer', {}, po );
    }


    function cancelButtonHandler( e ) {
        e.preventDefault();

        var cancelMessage = 'There is no penalty for removing a custom offer before it is accepted. Are you sure?';

        app.modal({
            title: 'Remove Custom Offer',
            text: cancelMessage,
            buttons: [
                { text: 'Yes', bold: true, onClick: cancelPartialOffer },
                { text: 'No' }
          ]
        });
    }

    function cancelPartialOffer() {
        app.showPreloader('Removing Custom Offer');
        TempStars.Api.cancelPartialOffer( TempStars.User.getCurrentUser().hygienistId, job.id, job.partialOffers[0].id )
        .then( function() {
            app.hidePreloader();
            app.modal({
                title: 'Your Custom Offer Has Been Removed',
                text: '',
                buttons: [
                    { text: 'OK', bold: true, onClick: function() {
                        TempStars.Analytics.track( 'Removed Custom Offer' );
                        TempStars.Hygienist.Router.goBackPage();
                    } }
              ]
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error removing custom offer. Please try again.' );
        });
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Api.getJob( params.id )
                    .then( function( j ) {
                        job = j;
                        job.partialOffers = _(job.partialOffers).filter(['hygienistId', TempStars.User.getCurrentUser().hygienistId]).value();
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Api.getHygienistPartialOffers( TempStars.User.getCurrentUser().hygienistId )
                    .then( function( pos ) {
                        var a = _(pos).filter(['job.startDate', params.date] ).value();
                        job = a[0].job;
                        job.partialOffers = a;
                        resolve( job );
                    })
                    // TempStars.Hygienist.getHygienistPartialOffers( params.date )
                    // .then( function( jobs ) {
                    //     job = jobs[0];
                    //     job.partialOffers = _(job.partialOffers).filter(['hygienistId', TempStars.User.getCurrentUser().hygienistId]).value();
                    //     resolve( job );
                    // })
                    .catch( function( err ) {
                        reject( err );
                    });
                }

            });
        }
    };

})();

TempStars.Pages.Hygienist.JobPartial.init();
