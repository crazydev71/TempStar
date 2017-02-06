
TempStars.Pages.Hygienist.MakePartialOffer = (function() {

    'use strict';

    var job,
        startTimePicker,
        endTimePicker,
        unpaidTimePicker,
        initialized = false,
        totalMinutes,
        unpaidMinutes,
        billableMinutes,
        totalAmt;


    function init() {

        app.onPageBeforeInit( 'hygienist-make-partial-offer', function( page ) {
            job = page.context;

            if ( ! Template7.global.web ) {

            startTimePicker = app.picker({
                input: '#hygienist-make-partial-offer-starttime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Offered Start Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',

                rotateEffect: false,
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 5; i < 23; i++ ) {
                                for ( var j = 0; j <  60; j = j + 15 ) {
                                    timeStr = moment().hours(i).minutes(j).format('h:mm a');
                                    vals.push( timeStr );
                                }
                            }
                            return vals;
                        })()
                }],
                onOpen: function( picker ) {
                    if ( picker.cols[0].activeIndex == 0 ) {
                        var fullTime = page.context.shifts[0].postedStart;
                        var timeStr = moment.utc( fullTime ).local().format('h:mm a');
                        picker.setValue( [ timeStr ], 0 );
                    }
                }
            });

            endTimePicker = app.picker({
                input: '#hygienist-make-partial-offer-endtime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Offered End Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
                rotateEffect: false,
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 5; i < 23; i++ ) {
                                for ( var j = 0; j <  60; j = j + 15 ) {
                                    timeStr = moment().hours(i).minutes(j).format('h:mm a');
                                    vals.push( timeStr );
                                }
                            }
                            return vals;
                        })()
                }],
                onOpen: function( picker ) {
                    if ( picker.cols[0].activeIndex == 0 ) {
                        var fullTime = page.context.shifts[0].postedEnd;
                        var timeStr = moment.utc( fullTime ).local().format('h:mm a');
                        picker.setValue( [ timeStr ], 0 );
                    }
                }
            });
            }

            $$('#hygienist-make-partial-offer-submit-button').on( 'click', submitButtonHandler );
            TempStars.Analytics.track( 'Viewed Make Partial Offer' );
            initialized = true;
        });

    }

    function submitButtonHandler( e ) {

        var constraints = {
            offeredStart: {
                presence: true,
                time: true
            },
            offeredEnd: {
                presence: true,
                time: true
            }
        };

        // Clear errors
        $$('#hygienist-make-partial-offer-form .form-error-msg').html('');
        $$('#hygienist-make-partial-offer-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#hygienist-make-partial-offer-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.offeredStart ) {
                $$('#hygienist-make-partial-offer-starttime').addClass('error').next().html( errors.offeredStart[0] );
            }
            if ( errors.offeredEnd ) {
                $$('#hygienist-make-partial-offer-endtime').addClass('error').next().html( errors.offeredEnd[0] );
            }
            return;
        }

        // Validate start time is before end time
        if ( moment(formData.offeredStart, 'hh:mm a').toDate().getTime() >= moment(formData.offeredEnd, 'hh:mm a').toDate().getTime() ) {
            $$('#hygienist-make-partial-offer-form .form-error-msg')
                .html('<span class="ti-alert"></span> Start time must be before end time.')
                .show();
            return;
        }

        // Validate start time is not before the posted start time
        var offeredStartMin = moment(formData.offeredStart, 'hh:mm a').hour() * 60 + moment(formData.offeredStart, 'hh:mm a').minute();
        var postedStartMin = moment.utc(job.shifts[0].postedStart).local().hour() * 60 + moment.utc(job.shifts[0].postedStart).local().minute();

        if ( offeredStartMin < postedStartMin ) {
            $$('#hygienist-make-partial-offer-form .form-error-msg')
                .html('<span class="ti-alert"></span> Offered start time can\'t be before the posted start time.')
                .show();
            return;
        }

        // Validate end time is not after posted end time
        var offeredEndMin = moment(formData.offeredEnd, 'hh:mm a').hour() * 60 + moment(formData.offeredEnd, 'hh:mm a').minute();
        var postedEndMin = moment.utc(job.shifts[0].postedEnd).local().hour() * 60 + moment.utc(job.shifts[0].postedEnd).local().minute();

        if ( offeredEndMin > postedEndMin ) {
            $$('#hygienist-make-partial-offer-form .form-error-msg')
                .html('<span class="ti-alert"></span> Offered end time can\'t be after the posted end time.')
                .show();
            return;
        }

        // Validate offer is not same as posted hours
        if ( offeredStartMin == postedStartMin && offeredEndMin == postedEndMin ) {
            $$('#hygienist-make-partial-offer-form .form-error-msg')
                .html('<span class="ti-alert"></span> Offered times can\'t be the same as the posted times.')
                .show();
            return;
        }

        app.modal({
            title:  'Make Partial Offer',
            text: 'If the dentist accepts your offer, you are committing to work at:<br>' +
                job.dentist.practiceName + '<br>' +
                moment( job.startDate ).format('ddd MMM D, YYYY') + '<br>' +
                formData.offeredStart + ' - ' +
                formData.offeredEnd + '<br><br>' +
                '<b>There are penalties for<br>cancelling booked shifts.</b><br><br>' +

                '<b>Are you sure?</b>',
            buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: function() {
                  makePartialOffer( formData );
              } }
            ]
        });
    }

    function makePartialOffer( formData ) {

        var hygienistId,
            data,
            fullStartTime,
            fullEndTime,
            hours,
            minutes;

        app.showPreloader('Making Partial Offer');

        hygienistId = TempStars.User.getCurrentUser().hygienistId;

        console.dir( formData );
        hours = moment( formData.offeredStart, 'h:mm a' ).hours();
        minutes = moment( formData.offeredStart, 'h:mm a' ).minutes();
        fullStartTime = moment( job.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        hours = moment( formData.offeredEnd, 'h:mm a' ).hours();
        minutes = moment( formData.offeredEnd, 'h:mm a' ).minutes();
        fullEndTime = moment( job.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        var now = moment.utc().format('YYYY-MM-DD HH:mm:ss');

        data = {
            offeredStartTime: fullStartTime,
            offeredEndTime: fullEndTime,
            createdOn: now
        };

        console.dir( data );
        TempStars.Api.makePartialOffer( hygienistId, job.id, data )
        .then( function() {
            app.hidePreloader();
            app.alert( 'Partial Offer Submitted!', function() {
                TempStars.Analytics.track( 'Made Partial Offer' );

                TempStars.Hygienist.Router.goForwardPage('home');
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error submitting partial offer: ' + err.error.message, function() {
                if ( err.error.message == 'Job is no longer available.' ) {
                    TempStars.Hygienist.Router.goBackPage('available-jobs');
                }
            });
        });

    }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Hygienist.MakePartialOffer.init();
