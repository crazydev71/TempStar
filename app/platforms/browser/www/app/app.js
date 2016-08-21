
// Determine theme depending on device
var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;
var userLoggedIn = false;
var isDentist = true;

// Set Template7 global devices flags
Template7.global = {
    android: isAndroid,
    ios: isIos
};

// Define Dom7
var $$ = Dom7;

// If on Android, change Through navbar layout to Fixed
if (isAndroid) {
    // Change class
    $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
    // And move Navbar into Page
    $$('.view .navbar').prependTo('.view .page');
}

// Setup App
var app = new Framework7({
    // Enable Material theme for Android device only
    material: isAndroid ? true : false,
    template7Pages: true,
    init: false,
    modalTitle: 'TempStars'
});

// Initialize Views
var mainView = app.addView('.view-main', {
    dynamicNavbar: true,
    domCache: false
});

// Initialize App
app.init();

// If the user is already logged in, go directly to the main view
if ( userLoggedIn ) {
    $$('#landing-page').hide();
    //$$('#main-page').show();
    if ( isDentist ) {
        mainView.router.loadPage( { url: 'dentist.html', animatePages: false } );
    }
    else {
        mainView.router.loadPage( { url: 'hygienist.html', animatePages: false } );
    }
    setupMenu();
}
else {
    mainView.hideNavbar();    
}


app.onPageInit( 'login', function(page) {
    $('#login-button').on( 'click', function(e) {
        userLoggedIn = true;
        isDentist = false;
        $$('.view-landing').hide();
        $$('.view-main').show();
        mainView.router.loadPage( { url: 'hygienist/hygienist.html', animatePages: false } );
        mainView.router.reloadPage( 'hygienist.html' );
        setupMenu();
    });
});

app.onPageInit( 'signup', function(page) {
    $('#signup-button').on( 'click', function(e) {
        userLoggedIn = true;
        isDentist = true;
        mainView.router.loadPage( { url: 'dentist/dentist.html', animatePages: false } );
        $$('.view-landing').hide();
        $$('.view-main').show();
        setupMenu();
    });
});

app.onPageInit( 'forgot-password', function( page ) {
    $('#forgot-password-button').on( 'click', function(e) {
        $$('#forgot-password-status').show();
    })
});

app.onPageInit( 'landing', function( page ) {
    landingView.hideNavbar();
});

// app.onPageBeforeInit( 'login', function( page ) {
//     landingView.showNavbar();
// });
//
// app.onPageBeforeInit( 'signup', function( page ) {
//     landingView.showNavbar();
// });

app.onPageBeforeInit( 'hygienist', function( page ) {
    //mainView.showNavbar();
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


app.onPageBeforeInit( 'dentist', function( page ) {
    //mainView.showNavbar();
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

app.onPageBeforeInit( 'jobs', function( page ) {

    $('#jobs-office-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $('#jobs-date-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

});

app.onPageBeforeInit( 'invoices', function( page ) {

    $('#invoices-office-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $('#invoices-date-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $$('#invoices-create-manual-button').on( 'click', function(e) {
        app.modal( { title: 'Create Manual Invoice',
            text: 'Apple Valley Dental<br>Aug 16, 2016<br>8am - 6pm',
            afterText: '<br>Offered hours:<br>from <input type="text" value="9:00"><br>to&nbsp;&nbsp;&nbsp; <input type="text" value="3:00">',
            buttons: [
                { text: 'Cancel'},
                { text: 'Send Invoice', bold: true, onClick: sendInvoice }
            ]
        });
    });
});

app.onPageBeforeInit( 'settings', function( page ) {
    $$('.settings-remove-blocked-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Blocked Office', function() {
            app.alert( 'All set!' );
        });
    });

    $$('.settings-remove-fav-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Favourite Office', function() {
            app.alert( 'All set!' );
        });
    });
});

app.onPageBeforeInit( 'dentist-settings', function( page ) {
    $$('.dentist-settings-remove-blocked-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Blocked Hygienist', function() {
            app.alert( 'All set!' );
        });
    });

    $$('.dentist-settings-remove-fav-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Remove Favourite Hygienist', function() {
            app.alert( 'All set!' );
        });
    });
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


app.onPageBeforeInit( 'dentist', function( page ) {
    mainView.showNavbar();
});

function setupMenu() {
    var menuContent;
    if ( isDentist ) {
        menuContent = $('#dentist-menu').html();
    }
    else {
        menuContent = $('#hygienist-menu').html();
    }
   $('#panel-menu').html(menuContent);

   $('.logout-link').on( 'click', function(e) {
       app.confirm( 'Are you sure you want to log out?', logout );
   });

}

app.onPageBeforeInit( 'post-job', function( page ) {

    var jobCalendar = app.calendar({
        input: '#job-calendar-input',
        multiple: false
    });

    var today = new Date();

    var jobStartTime = app.picker({
        input: '#job-start-time-input',
        toolbar: false,
        rotateEffect: true,
        value: [ '08:00'],
        cols: [
            { values: (function() {
                    var vals = [],
                        timeStr;
                    for ( var i = 0; i < 24; i++ ) {
                        for ( var j = 0; j <  60; j = j + 15 ) {
                            timeStr = ('00' + i).slice(-2);
                            timeStr += ':' + ('00' + j).slice(-2);
                            vals.push( timeStr );
                        }
                    }
                    return vals;
                })()
        }]
    });

    var jobEndTime = app.picker({
        input: '#job-end-time-input',
        toolbar: false,
        rotateEffect: true,
        value: [ '05:00'],
        cols: [
            { values: (function() {
                    var vals = [],
                        timeStr;
                    for ( var i = 0; i < 24; i++ ) {
                        for ( var j = 0; j <  60; j = j + 15 ) {
                            timeStr = ('00' + i).slice(-2);
                            timeStr += ':' + ('00' + j).slice(-2);
                            vals.push( timeStr );
                        }
                    }
                    return vals;
                })()
        }]
    });

    $$('#job-post-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Post Job', function() {
            app.alert( 'Job posted!', function() {
                mainView.router.back( { pageName: 'dentist'});
            });
        });
    });


});


function logout() {
    // Remove from local storage
    app.closePanel();
    userLoggedIn = false;
    isDentist = false;
    $$('.view-main').hide();
    $$('.view-landing').show();
    landingView.router.loadPage( { url: 'landing/login.html', animatePages: false } );
}

function setupListeners() {

}
