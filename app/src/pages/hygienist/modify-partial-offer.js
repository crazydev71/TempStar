
TempStars.Pages.Hygienist.ModifyPartialOffer = (function() {

    'use strict';

    var partialOffer,
        startTime,
        endTime;

    function init() {

        app.onPageBeforeInit( 'modify-partial-offer', function( page ) {
            partialOffer = page.context;
            startTime = moment.utc( partialOffer.offeredStartTime ).local().format('h:mm a');
            endTime = moment.utc( partialOffer.offeredEndTime ).local().format('h:mm a');

            app.picker({
                input: '#hygienist-modify-partial-offer-starttime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Starting Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',

                rotateEffect: true,
                value: [ startTime ],
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 0; i < 24; i++ ) {
                                for ( var j = 0; j <  60; j = j + 15 ) {
                                    timeStr = moment().hours(i).minutes(j).format('h:mm a');
                                    vals.push( timeStr );
                                }
                            }
                            return vals;
                        })()
                }]
            });

            app.picker({
                input: '#hygienist-modify-partial-offer-endtime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Ending Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
                rotateEffect: true,
                value: [ endTime ],
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 0; i < 24; i++ ) {
                                for ( var j = 0; j <  60; j = j + 15 ) {
                                    timeStr = moment().hours(i).minutes(j).format('h:mm a');
                                    vals.push( timeStr );
                                }
                            }
                            return vals;
                        })()
                }]
            });

            $$('#hygienist-modify-partial-offer-button').on( 'click', modifyPartialOfferHandler );
        });
    }

    function modifyPartialOfferHandler( e ) {

        var constraints = {
            offeredStartTime: {
                presence: true
            },
            offeredEndTime: {
                presence: true
            }
        };

        // Clear errors
        $$('#hygienist-modify-partial-offer-form .form-error-msg').html('');
        $$('#hygienist-modify-partial-offer-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#hygienist-modify-partial-offer-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.offeredStartTime ) {
                $$('#hygienist-modify-partial-offer-form input[name="offeredStartTime"]').addClass('error').next().html( errors.offeredStartTime[0] );
            }
            if ( errors.offeredEndTime ) {
                $$('#hygienist-modify-partial-offer-form input[name="offeredEndTime"]').addClass('error').next().html( errors.offeredEndTime[0] );
            }
            return;
        }

        // Validate start time is before end time
        if ( moment(formData.offeredStartTime, 'hh:mm a').toDate().getTime() >= moment(formData.offeredEndTime, 'hh:mm a').toDate().getTime() ) {
            $$('#hygienist-modify-partial-offer-form .form-error-msg')
                .html('<span class="ti-alert"></span> Starting time must be before ending time.')
                .show();
            return;
        }

        var confirmMessage =
            moment( partialOffer.startDate ).format('ddd, MMM D, YYYY') + '<br>' +
            formData.offeredStartTime + ' - ' +
            formData.offeredEndTime + '<br>';

        app.confirm( confirmMessage, 'Modify Partial Offer?', function() {
            modifyPartialOffer( formData );
        });
    }

    function modifyPartialOffer( formData ) {
        var hygienistId,
            shiftId,
            data,
            fullStartTime,
            fullEndTime,
            hours,
            minutes;

        app.showPreloader('Modifying Partial Offer');

        hours = moment( formData.offeredStartTime, 'h:mm a' ).hours();
        minutes = moment( formData.offeredStartTime, 'h:mm a' ).minutes();
        fullStartTime = moment( partialOffer.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        hours = moment( formData.offeredEndTime, 'h:mm a' ).hours();
        minutes = moment( formData.offeredEndTime, 'h:mm a' ).minutes();
        fullEndTime = moment( partialOffer.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        data = {
            offeredStartTime: fullStartTime,
            offeredEndTime: fullEndTime
        };

        TempStars.Api.modifyPartialOffer( partialOffer.id, data )
        .then( function() {
            app.hidePreloader();
            TempStars.Hygienist.Router.goBackPage('', { id: partialOffer.jobId });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error modifying partial offer. Please try again.' );
        });

    }

    return {
        init: init,

        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Hygienist.ModifyPartialOffer.init();