'use strict';

window.TempStars = window.TempStars || {};
window.TempStars.Pages = {};

TempStars.bootstrap = {

    initialize: function() {

        // Define Dom7 as global
        window.$$ = Dom7;

        // Setup app
        window.app = new Framework7({
            // Enable Material theme for Android device only
            //material: isAndroid ? true : false,
            // TODO switch this to be set at build time
            material: false,
            template7Pages: true,
            modalTitle: 'TempStars',
            animateNavBackIcon: true
        });

        // Initialize main view
        window.mainView = app.addView('.view-main', {
            dynamicNavbar: true,
            domCache: false
        });

        // Handle device events
        if ( window.cordova ) {
            this.bindEvents();
        }
        else {
            this.onDeviceReady();
        }
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("resume", this.onResume, false);
    },

    onDeviceReady: function() {
        var isAndroid,
            isIos;

        // Get device for setting theme
        isAndroid = Framework7.prototype.device.android === true;
        isIos = Framework7.prototype.device.ios === true;

        // Set Template7 global devices flags
        Template7.global = {
            android: isAndroid,
            ios: isIos
        };

        // If running on Android, use material theme and change navbar to fixed
        // if (isAndroid) {
        //     $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
        //     $$('.view .navbar').prependTo('.view .page');
        // }
    },

    onResume: function() {
    }
};


TempStars.bootstrap.initialize();
