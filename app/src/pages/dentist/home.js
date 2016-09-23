TempStars.Pages.Dentist.Home = (function() {
    'use strict';

    function init() {
        app.onPageBeforeInit( 'home', function( page ) {
            mainView.showNavbar();
            displayCalendar();
        });

        app.onPageBeforeRemove( 'home', function( page ) {

        });
    }

    function displayCalendar() {

        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];

        var calendarInline = app.calendar({
            container: '#calendar-inline-container',
            value: [new Date()],
            weekHeader: true,
            firstDay: 0,
            toolbarTemplate:
                '<div class="toolbar calendar-custom-toolbar">' +
                    '<div class="toolbar-inner">' +
                        '<div class="left">' +
                            '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
                        '</div>' +
                        '<div class="center"></div>' +
                        '<div class="right">' +
                            '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            onOpen: function (p) {
                $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
                $$('.calendar-custom-toolbar .left .link').on('click', function () {
                    calendarInline.prevMonth();
                });
                $$('.calendar-custom-toolbar .right .link').on('click', function () {
                    calendarInline.nextMonth();
                });
            },
            onMonthYearChangeStart: function (p) {
                $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
            },
            events: [
                // JS month starts with zero
                new Date(2016, 8, 26),
                new Date(2016, 8, 27),
                new Date(2016, 8, 29),
                new Date(2016, 8, 9)
            ],

            rangesClasses: [
                {
                    cssClass: 'calendar-posted',
                    range: [
                        new Date(2016, 8, 29),
                        new Date(2016, 8, 30)
                    ]
                },
                {
                    cssClass: 'calendar-partial',
                    range: [
                        new Date(2016, 8, 26),
                        new Date(2016, 8, 27)
                    ]
                },
                {
                    cssClass: 'calendar-confirmed',
                    range: [
                        new Date(2016, 8, 22),
                        new Date(2016, 8, 23)
                    ]
                },
                {
                    cssClass: 'calendar-completed',
                    range: [
                        new Date(2016, 8, 8),
                        new Date(2016, 8, 9)
                    ]
                }
            ],

            onDayClick: function(picker, dayContainer, dateYear, dateMonth, dateDay) {
                if ( $(dayContainer).hasClass('calendar-completed') ) {
                    completedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
                else if ( $(dayContainer).hasClass('calendar-confirmed') ) {
                    confirmedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
                else if ( $(dayContainer).hasClass('calendar-partial') ) {
                    partialDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
                else if ( $(dayContainer).hasClass('calendar-posted') ) {
                    postedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
            }
        });
    }

    function completedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'completed ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        //var param = { jobId: 4, year: dateYear, month: dateMonth, day: dateDay};
        //TempStars.Dentist.Router.goForwardPage( 'job-completed', param );
    }

    function confirmedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'confirmed ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
    }

    function partialDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'partial ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
    }

    function postedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'posted ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
    }


    return {
        init: init,
        getData: function( params ) {
            return Promise.resolve( TempStars.User.getCurrentUser() );
        }
    };

})();

TempStars.Pages.Dentist.Home.init();
