
TempStars.Pages.Hygienist.CreateInvoice = (function() {

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

        app.onPageBeforeInit( 'hygienist-create-invoice', function( page ) {
            job = page.context;
            startTimePicker = app.picker({
                input: '#hygienist-create-invoice-starttime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Actual Start Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',

                rotateEffect: false,
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
                }],
                onOpen: function( picker ) {
                    if ( picker.cols[0].activeIndex == 0 ) {
                        var fullTime = page.context.shifts[0].postedStart;
                        var timeStr = moment.utc( fullTime ).subtract(2, 'hour').local().format('h:mm a');
                        picker.setValue( [ timeStr ], 0 );
                    }
                },
                onClose: function( picker ) {
                    updateTotals();
                }
            });

            endTimePicker = app.picker({
                input: '#hygienist-create-invoice-endtime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Actual End Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
                rotateEffect: false,
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
                }],
                onOpen: function( picker ) {
                    if ( picker.cols[0].activeIndex == 0 ) {
                        var fullTime = page.context.shifts[0].postedEnd;
                        var timeStr = moment.utc( fullTime ).subtract(2, 'hour').local().format('h:mm a');
                        picker.setValue( [ timeStr ], 0 );
                    }
                },
                onClose: function( picker ) {
                    updateTotals();
                }
            });


            unpaidTimePicker = app.picker({
                input: '#hygienist-create-invoice-unpaid',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Unpaid Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
                rotateEffect: false,
                value: [ '0 min'],
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 0; i <= 120; i += 15 ) {
                                    timeStr = i + ' min';
                                    vals.push(timeStr);
                            }
                            return vals;
                        })()
                }],
                onClose: function( picker ) {
                    updateTotals();
                }

            });
            $$('#hygienist-create-invoice-button').on( 'click', createInvoiceButtonHandler );
            TempStars.Analytics.track( 'Viewed Create Invoice' );

            initialized = true;
        });

    }

    function updateTotals() {

        if ( ! startTimePicker.initialized || ! endTimePicker.initialized ) {
            return;
        }

        var startTime = moment( startTimePicker.value[0], 'h:mm a' );
        var endTime = moment( endTimePicker.value[0], 'h:mm a' );

        totalMinutes = endTime.diff( startTime, 'minutes');
        unpaidMinutes = parseInt(unpaidTimePicker.value[0].replace(' min'));
        billableMinutes = endTime.diff( startTime, 'minutes') - unpaidMinutes;

        if ( billableMinutes <= 0 ) {
            billableMinutes = 0;
        }
        totalAmt = (billableMinutes/60) * job.hourlyRate;

        // var totalTime = formatMinutesAsTime( totalMinutes );
        // var unpaidTime = formatMinutesAsTime( unpaidMinutes );
        //var billableTime = formatMinutesAsTime( billableMinutes );

        $$('#hygienist-create-invoice-total-hours').html( formatMinutesAsTime( totalMinutes ) );
        $$('#hygienist-create-invoice-total-unpaid').html( formatMinutesAsTime( unpaidMinutes ) );
        $$('#hygienist-create-invoice-billable-hours').html( formatMinutesAsTime( billableMinutes ) );
        $$('#hygienist-create-invoice-total-invoice').html( totalAmt.toFixed(2) );
    }

    function formatMinutesAsTime( totalMinutes ) {
        var hours = totalMinutes / 60 | 0;
        var minutes = totalMinutes % 60 | 0;
        hours = (hours < 0) ? '0' : hours;
        minutes = (minutes < 0) ? '0' : minutes;
        var totalTime = hours + ':' + _.padStart( minutes, 2, '0');
        return totalTime;
    }

    function getJobDate( job ) {
        return moment(job.startDate).startOf('day').toDate();
    }

    function createInvoiceButtonHandler( e ) {

        var constraints = {
            actualStart: {
                presence: true
            },
            actualEnd: {
                presence: true
            },
            unpaidTime: {
                presence: true
            }
        };

        // Clear errors
        $$('#hygienist-create-invoice-form .form-error-msg').html('');
        $$('#hygienist-create-invoice-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#hygienist-create-invoice-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.actualStart ) {
                $$('#hygienist-create-invoice-form input[name="actualStart"]').addClass('error').next().html( errors.actualStart[0] );
            }
            if ( errors.actualEnd ) {
                $$('#hygienist-create-invoice-form input[name="actualEnd"]').addClass('error').next().html( errors.actualEnd[0] );
            }
            if ( errors.unpaidTime ) {
                $('#hygienist-create-invoice-form input[name="unpaidTime"]').addClass('error').next().html( errors.unpaidTime[0] );
            }
            return;
        }

        // Validate start time is before end time
        if ( moment(formData.actualStart, 'hh:mm a').toDate().getTime() >= moment(formData.actualEnd, 'hh:mm a').toDate().getTime() ) {
            $$('#hygienist-create-invoice-form .form-error-msg')
                .html('<span class="ti-alert"></span> Start time must be before end time.')
                .show();
            return;
        }

        // Validate total amount is more than zero
        if ( parseInt( $$('#hygienist-create-invoice-total-invoice').html()) <= 0 ) {
            $$('#hygienist-create-invoice-form .form-error-msg')
                .html('<span class="ti-alert"></span> Total amount must be more than zero.')
                .show();
            return;
        }

        app.confirm(
            'To: ' + job.dentist.practiceName + '<br>' +
            'For: $' + $$('#hygienist-create-invoice-total-invoice').html(),
            'Create &amp; Send Invoice?', function() {
            createInvoice( formData );
        });
    }

    function createInvoice( formData ) {

        var hygienistId,
            data,
            fullStartTime,
            fullEndTime,
            hours,
            minutes;

        app.showPreloader('Sending Invoice');

        hygienistId = TempStars.User.getCurrentUser().hygienistId;

        hours = moment( formData.actualStart, 'h:mm a' ).hours();
        minutes = moment( formData.actualStart, 'h:mm a' ).minutes();
        fullStartTime = moment( job.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        hours = moment( formData.actualEnd, 'h:mm a' ).hours();
        minutes = moment( formData.actualEnd, 'h:mm a' ).minutes();
        fullEndTime = moment( job.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        var now = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        var totalHours = $$('#hygienist-create-invoice-total-hours').html();
        var unpaidHours = $$('#hygienist-create-invoice-total-unpaid').html();
        var billableHours = $$('#hygienist-create-invoice-billable-hours').html();

        data = {
            actualStart: fullStartTime,
            actualEnd: fullEndTime,
            totalHours: totalMinutes/60,
            unpaidHours: unpaidMinutes/60,
            billableHours: billableMinutes/60,
            totalAmt: totalAmt,
            hourlyRate: job.hourlyRate,
            createdOn: now,
            sentOn: now
        };

        // Render HTML and send to server
        $.get( 'hygienist/invoice-template.html' )
        .then( function( template ) {
            var compiledTemplate = Template7.compile( template );
            var htmlData = data;
            htmlData.job = job;
            var html = compiledTemplate( htmlData );

            data.html = html;
            TempStars.Api.sendInvoice( job.id, data )
            .then( function() {

                //UPDATE INVITE STATUS
                TempStars.Api.updateInviteStatus(hygienistId);

                TempStars.Api.updateJob( job.id, {status: TempStars.Job.status.COMPLETED} )
                .then( function() {
                    app.hidePreloader();
                    TempStars.Analytics.track( 'Marked Job as Complete' );

                    app.alert( 'Invoice Sent', function() {
                        TempStars.Analytics.track( 'Sent Invoice' );
                        TempStars.Hygienist.Router.goBackPage('', {id: job.id, invoiceSubmitted: true} );
                    });
                })
                .catch( function( err ) {
                    app.hidePreloader();
                    app.alert( 'Error marking job as complete. Please try again.' );
                });
            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert( 'Error sending invoice. Please try again' );
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error sending invoice. Please try again.')
        });
    }

    return {
        init: init,

        getData: function() {
            return new Promise( function( resolve, reject ) {
                TempStars.Hygienist.getAllJobs()
                .then( function( data ) {
                    var jobs = _(data)
                        .map( getJobDate )
                        .value();
                    resolve( jobs );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        }
    };

})();

TempStars.Pages.Hygienist.CreateInvoice.init();
