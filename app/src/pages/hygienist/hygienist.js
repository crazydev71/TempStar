
// app.onPageInit( 'hygienist', function( page ) {
//     var someName;
//
//     someName = app.alert( 'hygienist init' );
// });

app.onPageBeforeInit( 'hygienist', function( page ) {
    mainView.showNavbar();
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
            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
            $$('.calendar-custom-toolbar .left .link').on('click', function () {
                calendarInline.prevMonth();
            });
            $$('.calendar-custom-toolbar .right .link').on('click', function () {
                calendarInline.nextMonth();
            });
        },
        onMonthYearChangeStart: function (p) {
            $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        },
        events: [
            new Date(2016, 7, 10),
            new Date(2016, 7, 23)
        ],

        rangesClasses: [
            {
                cssClass: 'calendar-openings',
                range: [
                    new Date(2016, 7, 26),
                    new Date(2016, 7, 29)
                ]
            },
            {
                cssClass: 'calendar-offers',
                range: [
                    new Date(2016, 7, 23),
                    new Date(2016, 7, 24)
                ]
            },
            {
                cssClass: 'calendar-booked',
                range: [
                    new Date(2016, 7, 16),
                    new Date(2016, 7, 17),
                    new Date(2016, 7, 19)
                ]
            },
            {
                cssClass: 'calendar-worked',
                range: [
                    new Date(2016, 7, 2),
                    new Date(2016, 7, 10)
                ]
            }
        ]
    });

});



$('#avail-posting-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#avail-work-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#avail-distance-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});


$$('.avail-book-button').on( 'click', function(e) {
    app.confirm('Are you sure?', 'Book Job', function() {
        app.alert( 'You\'re booked!' );
    });
});

$('#offered-posting-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#offered-work-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#offered-distance-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});


$$('.offered-cancel-button').on( 'click', function(e) {
    app.confirm('Are you sure?', 'Cancel Partial Offer', function() {
        app.alert( 'You\'re cancelled!' );
    });
});

$$('.booked-cancel-button').on( 'click', function(e) {
    app.confirm('Are you sure?', 'Cancel Booked Job', function() {
        app.alert( 'You\'re cancelled!' );
    });
});



$$('.avail-partial-button').on( 'click', function(e) {
    app.modal( { title: 'Make Partial Offer',
        text: 'Apple Valley Dental<br>Aug 16, 2016<br>8am - 6pm',
        afterText: '<br>Offered hours:<br>from <input type="text"><br>to <input type="text">',
        buttons: [
            { text: 'Cancel'},
            { text: 'Make Offer', bold: true, onClick: makePartialOffer }
        ]
    });
});

function makePartialOffer() {
    app.alert( 'You\'ve made a partial offer!' );
}

$$('.offered-modify-button').on( 'click', function(e) {
    app.modal( { title: 'Modify Partial Offer',
        text: 'Apple Valley Dental<br>Aug 16, 2016<br>8am - 6pm',
        afterText: '<br>Offered hours:<br>from <input type="text" value="9:00"><br>to&nbsp;&nbsp;&nbsp; <input type="text" value="3:00">',
        buttons: [
            { text: 'Cancel'},
            { text: 'Modify Offer', bold: true, onClick: makePartialOffer }
        ]
    });
});

$('#booked-posting-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#booked-work-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#booked-distance-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#completed-posting-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#completed-work-date-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$('#completed-distance-button').on( 'click', function(e) {
    $(this).addClass('active').siblings().removeClass('active');
});

$$('.completed-invoice-button').on( 'click', function(e) {
    app.modal( { title: 'Create Invoice',
        text: 'Apple Valley Dental<br>Aug 16, 2016<br>8am - 6pm',
        afterText: '<br>Offered hours:<br>from <input type="text" value="9:00"><br>to&nbsp;&nbsp;&nbsp; <input type="text" value="3:00">',
        buttons: [
            { text: 'Cancel'},
            { text: 'Send Invoice', bold: true, onClick: sendInvoice }
        ]
    });
});

function sendInvoice() {
    app.alert( 'Invoice sent!' );
}



$$('.completed-survey-button').on( 'click', function(e) {
    app.modal( { title: 'Take Survey',
        text: 'Apple Valley Dental<br>Aug 16, 2016<br>8am - 6pm',
        afterText: '<br>Offered hours:<br>from <input type="text" value="9:00"><br>to&nbsp;&nbsp;&nbsp; <input type="text" value="3:00">',
        buttons: [
            { text: 'Cancel'},
            { text: 'Submit', bold: true, onClick: submitSurvey }
        ]
    });
});

function submitSurvey() {
    app.alert( 'Survey submitted!' );
}
