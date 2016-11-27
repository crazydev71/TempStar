'use strict';

window.TempStars = window.TempStars || {};
window.TempStars.Pages = {};
window.TempStars.Pages.Dentist = {};
window.TempStars.Pages.Hygienist = {};


TempStars.bootstrap = {

    initialize: function() {

        // Define Dom7 as global
        window.$$ = Dom7;

        // Register helpers
        Template7.registerHelper('date_time_format', function(dateString) {
            return moment.utc( dateString ).local().format('MMM D, YYYY');
        });

        Template7.registerHelper('date_format', function(dateString) {
            return moment( dateString ).format('MMM D, YYYY');
        });

        Template7.registerHelper('date_format_day', function(dateString) {
            return moment( dateString ).format('ddd MMM D, YYYY');
        });

        Template7.registerHelper('time_format', function(timeString) {
            return moment.utc( timeString ).local().format('h:mm a');
        });

        Template7.registerHelper('hour_format', function(h) {
            var totalMinutes =  h * 60;
            var hours = totalMinutes / 60 | 0;
            var minutes = totalMinutes % 60 | 0;
            hours = (hours < 0) ? '0' : hours;
            minutes = (minutes < 0) ? '0' : minutes;
            return hours + ':' + _.padStart( minutes, 2, '0');
        });

        Template7.registerHelper('currency_format', function(moneyString ) {
            return moneyString.toFixed(2);
        });

        Template7.registerHelper('phone_format', function( phoneString ) {
            var justNumbers = phoneString.replace( /\D/g, '' );
            return justNumbers.substr(0, 3) + '-' + justNumbers.substr(3, 3) + '-' + justNumbers.substr(6,4);
        });


        // Setup app
        window.app = new Framework7({
            // Enable Material theme for Android device only
            //material: isAndroid ? true : false,
            // TODO switch this to be set at build time
            material: false,
            template7Pages: true,
            modalTitle: 'TempStars',
            animateNavBackIcon: true,
            cache: false
        });

        // Initialize main view
        window.mainView = app.addView('.view-main', {
            dynamicNavbar: true,
            domCache: false,
            preloadPreviousPage: false
        });

        // Handle device events
        if ( window.cordova ) {
            this.bindEvents();
        }
        else {
            window.device = {};
            window.device.platform = platform.name;
            window.device.version = platform.version;
            window.device.manufacturer = platform.os;
            window.device.model = '';
            setTimeout( this.onDeviceReady, 500);
        }
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("resume", this.onResume, false);
        document.addEventListener("pause", this.onPause, false);
    },

    onDeviceReady: function() {
        var isAndroid,
            isIos;

    console.log( 'DEVICE READY');
        // Get device for setting theme
        isAndroid = Framework7.prototype.device.android === true;
        isIos = Framework7.prototype.device.ios === true;

        // Set Template7 global devices flags
        Template7.global = {
            android: isAndroid,
            ios: isIos
        };

        // If running on Android, use material theme and change navbar to fixed
//         if (isAndroid) {
//             $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
// //            $$('.view .navbar').prependTo('.view .page');
//         }

        // Setup Android keyboard scrolling fix
        if ( isAndroid ) {
            TempStars.bootstrap.initAndroidKeyboardFix();
        }

        TempStars.App.init();
    },

    initAndroidKeyboardFix: function initAndroidKeyboardFix() {

        window.addEventListener('native.keyboardshow', function(e) {
            $('.footer').hide();
        });

        window.addEventListener('native.keyboardhide', function(e) {
            $('.footer').show();
        });

        $(document).on( 'focus', 'input', function(e) {

            // console.log( 'input focus on: ' + document.activeElement.name );
            // var st = $(document.activeElement).offset().top - 60;
            // console.log( 'scrolltop: ' + st );

            $('.page-content').animate({
                scrollTop: $(document.activeElement).offset().top - 60
            }, 500);

        });
    },

    onResume: function(e) {
        console.log('ON RESUME');

        var cameraOpen = window.localStorage.getItem( 'cameraOpen' );
        window.cameraOpen = (cameraOpen == 'true');

        if ( window.cameraOpen ) {
            console.log( 'in camera app' );
            return;
        }

        TempStars.Push.init();
        TempStars.Analytics.track( 'Opened App' );

        TempStars.User.autoLogin()
        .then( function() {
            TempStars.App.gotoStartingPage();
        })
        .catch( function() {
            console.log( 'autoLogin failed' );
            mainView.router.loadPage( 'index.html' );
        });
    },

    onPause: function(e) {
        if ( window.cameraOpen == undefined ) {
            window.cameraOpen = false;
        }
        window.localStorage.setItem( 'cameraOpen', window.cameraOpen );
    }
};


TempStars.bootstrap.initialize();
