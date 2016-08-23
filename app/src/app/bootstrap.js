'use strict';

var bootstrap = {

    initialize: function() {

        // Define Dom7 as global
        window.$$ = Dom7;

        if ( window.cordova ) {
            this.bindEvents();
        }
        else {
            this.onDeviceReady();
        }
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
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

        // Setup app
        window.app = new Framework7({
            // Enable Material theme for Android device only
            material: isAndroid ? true : false,
            template7Pages: true,
            init: false,
            modalTitle: 'TempStars',
            animateNavBackIcon: true
        });

        // Initialize main view
        window.mainView = app.addView('.view-main', {
            dynamicNavbar: true,
            domCache: false
        });

        // TODO: need index page on page init here?

        // Initialize App
        app.init();

        // If running on Android, use material theme and change navbar to fixed
        if (Framework7.prototype.device.android) {
              Dom7('head').append(
                  '<link rel="stylesheet" href="lib/framework7/css/framework7.material.min.css">' +
                  '<link rel="stylesheet" href="lib/framework7/css/framework7.material.colors.min.css">' +
                  '<link rel="stylesheet" href="css/tempstars.app.css">' +
                  '<link rel="stylesheet" href="css/tempstars.dentist.css">' +
                  '<link rel="stylesheet" href="css/tempstars.hygienist.css">' +
                  '<link rel="stylesheet" href="css/android.css">'
              );

              // Change navbar to fixed and move into page
              $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
              $$('.view .navbar').prependTo('.view .page');

          }
        else {
              Dom7('head').append(
                  '<link rel="stylesheet" href="lib/framework7/css/framework7.ios.min.css">' +
                  '<link rel="stylesheet" href="lib/framework7/css/framework7.ios.colors.min.css">' +
                  '<link rel="stylesheet" href="css/tempstars.app.css">' +
                  '<link rel="stylesheet" href="css/tempstars.dentist.css">' +
                  '<link rel="stylesheet" href="css/tempstars.hygienist.css">'
              );
        }
    }
};

bootstrap.initialize();
