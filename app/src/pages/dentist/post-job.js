
TempStars.Pages.Dentist.PostJob = (function() {

    'use strict';

    function init() {

        app.onPageBeforeInit( 'post-job', function( page ) {
            app.calendar({
                input: '#dentist-post-job-date',
                toolbar: true,
                firstDay: 0,
                dateFormat: 'D, M dd, yyyy',
                minDate: moment().subtract(1, 'days'),
                onDayClick: function(picker, dayContainer, dateYear, dateMonth, dateDay) {
                    picker.close();
                }
            });

            app.picker({
                input: '#dentist-post-job-starttime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Starting Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',

                rotateEffect: true,
                value: [ '8:00 am'],
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
                input: '#dentist-post-job-endtime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Ending Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
                rotateEffect: true,
                value: [ '5:00 pm'],
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

            $$('#denist-post-job-button').on( 'click', postJobHandler );
        });
    }

    function postJobHandler( e ) {
        var dentistId,
            data,
            fullStartTime,
            fullEndTime,
            hours,
            minutes;

        var constraints = {
            startDate: {
                presence: true,
            },
            postedStart: {
                presence: true
            },
            postedEnd: {
                presence: true
            }
        };

        // Clear errors
        $$('#dentist-post-job-form .form-error-msg').html('');
        $$('#dentist-post-job-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#dentist-post-job-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.startDate ) {
                $('#dentist-post-job-form input[name="startDate"]').addClass('error').next().html( errors.startDate[0] );
            }
            if ( errors.postedStart ) {
                $$('#dentist-post-job-form input[name="postedStart"]').addClass('error').next().html( errors.postedStart[0] );
            }
            if ( errors.postedEnd ) {
                $$('#dentist-post-job-form input[name="postedEnd"]').addClass('error').next().html( errors.postedEnd[0] );
            }
            return;
        }

        app.showPreloader('Posting Job');

        dentistId = TempStars.User.getCurrentUser().dentistId;

        hours = moment( formData.postedStart, 'h:mm a' ).hours(),
        minutes = moment( formData.postedStart, 'h:mm a' ).minutes();
        fullStartTime = moment( formData.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .format('YYYY-MM-DD HH:mm');

        hours = moment( formData.postedEnd, 'h:mm a' ).hours(),
        minutes = moment( formData.postedEnd, 'h:mm a' ).minutes();
        fullEndTime = moment( formData.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .format('YYYY-MM-DD HH:mm');

        data = {
            job: {
                postedOn: moment().format('YYYY-MM-DD HH:mm:ss'),
                startDate: formData.startDate
            },
            shifts: [
                {
                    shiftDate: formData.startDate,
                    startTime: fullStartTime,
                    endTime: fullEndTime
                }
            ]
        };

        TempStars.Api.postJob( dentistId, data )
        .then( function() {
            app.hidePreloader();
            app.alert( 'Job Posted', function() {
                mainView.router.back();
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error posting job.  Please try again' );
        });

    }

    function backHandler( e ) {
        $('#dentist-post-job-back').click();
    }

    return {
        init: init,

        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.PostJob.init();
