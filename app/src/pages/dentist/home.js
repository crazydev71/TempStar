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
                new Date(2016, 8, 23),
                new Date(2016, 8, 27),
                new Date(2016, 8, 9)
            ],

            rangesClasses: [
                {
                    cssClass: 'calendar-openings',
                    range: [
                        new Date(2016, 8, 29),
                        new Date(2016, 8, 30)
                    ]
                },

                {
                    cssClass: 'calendar-partials',
                    range: [
                        new Date(2016, 8, 26),
                        new Date(2016, 8, 27)
                    ]
                },
                // {
                //     cssClass: 'calendar-offers',
                //     range: [
                //         new Date(2016, 7, 23),
                //         new Date(2016, 7, 24)
                //     ]
                // },
                {
                    cssClass: 'calendar-booked',
                    range: [
                        new Date(2016, 8, 22),
                        new Date(2016, 8, 23)
                    ]
                },
                {
                    cssClass: 'calendar-worked',
                    range: [
                        new Date(2016, 8, 8),
                        new Date(2016, 8, 9)
                    ]
                }
            ]
        });
    }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( TempStars.User.getCurrentUser() );
        }
    };

})();

TempStars.Pages.Dentist.Home.init();
