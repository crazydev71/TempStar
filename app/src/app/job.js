
TempStars.Job = (function() {

    'use strict';

    var MAX_SHORT_HOURS = 5;
    var MAX_URGENT_HOURS = 48;
    var SUNDAY = 0;
    var SATURDAY = 6;
    var INCENTIVE_BOOST = 2;

    return {

        status:  {
            'POSTED': 1,
            'PARTIAL': 2,
            'CONFIRMED': 3,
            'COMPLETED': 4
        },

        isShortShift: function isShortShift( startTime, endTime ) {
            // If shift duration is less than the max short hours, it's short
            var start = moment( startTime, 'h:mm a' );
            var end = moment( endTime, 'h:mm a' );
            var diff = end.diff( start, 'hours', true );
            if ( diff < MAX_SHORT_HOURS ) {
                return true;
            }
            else {
                return false;
            }
        },

        isUrgent: function isUrgent( startDate, startTime ) {
            // If shift starts in less than max urgent time, e.g. 48 hours
            var hours = moment( startTime, 'h:mm a' ).hours();
            var minutes = moment( startTime, 'h:mm a' ).minutes();
            var start = moment( startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' );
            var now = moment();
            var diff = start.diff( now, 'hours' );
            if ( diff < MAX_URGENT_HOURS ) {
                return true;
            }
            else {
                return false;
            }
        },

        isWeekend: function isWeekend( jobDate ) {
            var dayOfWeek = moment( jobDate ).day();
            if ( dayOfWeek == SATURDAY || dayOfWeek == SUNDAY ) {
                return true;
            }
            else {
                return false;
            }
        },

        getHourlyRateBoost: function getHourlyRateBoost( data ) {
            var boost = 0;
            boost += ( data.short ) ? INCENTIVE_BOOST : 0;
            boost += ( data.urgent ) ? INCENTIVE_BOOST : 0;
            boost += ( data.weekend ) ? INCENTIVE_BOOST : 0;
            return boost;
        },

        checkIncentives: function checkIncentives( formData, confirmJob ) {

            var short   = TempStars.Job.isShortShift( formData.postedStart, formData.postedEnd );
            var urgent  = TempStars.Job.isUrgent( formData.startDate, formData.postedStart );
            var weekend = TempStars.Job.isWeekend( formData.startDate );
            var incentivesHTML = '';

            var shortIncentiveHTML =  '<li>' +
                                        '<label class="label-checkbox item-content">' +
                                        '<input type="checkbox" id="post-job-short-incentive" value="1" checked="checked">' +
                                        '<div class="item-media">' +
                                            '<i class="icon icon-form-checkbox"></i>' +
                                        '</div>' +
                                        '<div class="item-inner">' +
                                        '<div class="item-title" style="text-align:left;font-size:14px;">Shift less than 5 hours<br>' +
                                        '<span style="font-size:12px;text-align:left;margin-top:-3px;font-weight:normal">Offer +$2/hr incentive</span></div>' +
                                        '</div>' +
                                        '</label>' +
                                    '</li>';

            var weekendIncentiveHTML = '<li>' +
                                        '<label class="label-checkbox item-content">' +
                                        '<input type="checkbox" id="post-job-weekend-incentive" value="1" checked="checked">' +
                                        '<div class="item-media">' +
                                            '<i class="icon icon-form-checkbox"></i>' +
                                        '</div>' +
                                        '<div class="item-inner">' +
                                            '<div class="item-title" style="text-align:left;font-size:14px;">Weekend shift<br>' +
                                            '<span style="font-size:12px;text-align:left;margin-top:-3px;font-weight:normal">Offer +$2/hr incentive</span></div>' +

                                        '</div>' +
                                        '</label>' +
                                    '</li>';

            var urgentIncentiveHTML = '<li>' +
                                        '<label class="label-checkbox item-content">' +
                                        '<input type="checkbox" id="post-job-urgent-incentive" value="1" checked="checked">' +
                                        '<div class="item-media">' +
                                            '<i class="icon icon-form-checkbox"></i>' +
                                        '</div>' +
                                        '<div class="item-inner">' +
                                            '<div class="item-title" style="text-align:left;font-size:14px;">Less than 48 hours notice<br>' +
                                            '<span style="font-size:12px;text-align:left;margin-top:-3px;font-weight:normal">Offer +$2/hr incentive</span></div>' +
                                        '</div>' +
                                        '</label>' +
                                    '</li>';

            if ( short || urgent || weekend ) {

                incentivesHTML = '<div class="list-block" style="margin:10px;"><ul>';
                if ( short ) {
                    incentivesHTML += shortIncentiveHTML;
                }
                if ( urgent ) {
                    incentivesHTML += urgentIncentiveHTML;
                }
                if ( weekend ) {
                    incentivesHTML += weekendIncentiveHTML;
                }
                incentivesHTML += '</ul></div>';

                app.modal({
                    title: 'Offer Incentive?',
                    text: 'This job has the following challenges that lower the likelihood ' +
                          'of a successful placement. Maximize your chances for a successful ' +
                          'placement by offering incentive bonuses:',
                    afterText: incentivesHTML,
                    buttons: [
                        {
                            text: 'Add Incentive',
                            bold: true,
                            onClick: function( modal ) {
                                formData.bonus = 0;

                                var shortIncentive = $(modal).find('#post-job-short-incentive').prop('checked');
                                formData.short = (shortIncentive) ? 1 : 0;
                                formData.bonus += (shortIncentive) ? 2 : 0;

                                var urgentIncentive = $(modal).find('#post-job-urgent-incentive').prop('checked');
                                formData.urgent = (urgentIncentive) ? 1 : 0;
                                formData.bonus += (urgentIncentive) ? 2 : 0;

                                var weekendIncentive = $(modal).find('#post-job-weekend-incentive').prop('checked');
                                formData.weekend = (weekendIncentive) ? 1 : 0;
                                formData.bonus += (weekendIncentive) ? 2 : 0;

                                confirmJob( formData );
                            }
                        },
                        {
                            text: 'No incentive',
                            bold: false,
                            onClick: function() {
                                confirmJob( formData );
                            }
                        }
                    ]

                });
            }
            else {
                confirmJob( formData );
            }
        },

        offerIncentives: function offerIncentives( callback ) {
            var incentivesHTML =
                '<div class="list-block" style="margin:10px;"><ul>' +
                '<li>' +
                    '<label class="label-radio item-content">' +
                    '<input type="radio" name="manual-incentive" value="0">' +
                    '<div class="item-media">' +
                        '<i class="icon icon-form-checkbox"></i>' +
                    '</div>' +
                    '<div class="item-inner">' +
                    '<div class="item-title" style="text-align:left;font-size:14px;">+$0/hr' +
                    '</div>' +
                    '</label>' +
                '</li>' +
                '<li>' +
                    '<label class="label-radio item-content">' +
                    '<input type="radio" name="manual-incentive" value="2">' +
                    '<div class="item-media">' +
                        '<i class="icon icon-form-checkbox"></i>' +
                    '</div>' +
                    '<div class="item-inner">' +
                    '<div class="item-title" style="text-align:left;font-size:14px;">+$2/hr' +
                    '</div>' +
                    '</label>' +
                '</li>' +
                '<li>' +
                    '<label class="label-radio item-content">' +
                    '<input type="radio" name="manual-incentive" value="4" checked="checked">' +
                    '<div class="item-media">' +
                        '<i class="icon icon-form-checkbox"></i>' +
                    '</div>' +
                    '<div class="item-inner">' +
                    '<div class="item-title" style="text-align:left;font-size:14px;">+$4/hr (recommended)' +
                    '</div>' +
                    '</label>' +
                '</li>' +
                '<li>' +
                    '<label class="label-radio item-content">' +
                    '<input type="radio" name="manual-incentive" value="6">' +
                    '<div class="item-media">' +
                        '<i class="icon icon-form-checkbox"></i>' +
                    '</div>' +
                    '<div class="item-inner">' +
                    '<div class="item-title" style="text-align:left;font-size:14px;">+$6/hr' +
                    '</div>' +
                    '</label>' +
                '</li>' +
                '</ul></div>';

            app.modal({
                title: 'Choose Incentive Amount',
                text: incentivesHTML,
                buttons: [
                    {
                        text: 'Confirm',
                        bold: true,
                        onClick: function( modal ) {
                            var incentiveAmt = $(modal).find('input[type=radio]:checked').val();
                            if ( incentiveAmt >= 0 ) {
                                callback( incentiveAmt );
                            }
                        }
                    },
                    {
                        text: 'Cancel',
                        bold: false
                    }
                ]

            });
        }

    };
})();
