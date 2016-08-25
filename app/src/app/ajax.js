
// works for android emulator $$.getJSON('http://10.0.2.2:3000/api/Dentists', function( serverData )
// works for everythig locally $$.getJSON('http://10.0.1.45:3000/api/Dentists', function( serverData )
//$$.getJSON('https://riff:raff@api.tempstars.net/api/Dentists', function( serverData )

TempStars.Ajax = (function() {
    'use strict';

    var initialized = false;

    var userName = 'riff',
        password = 'raff',
        baseUrl = "https://api.tempstars.net/v2/",
        authHeader = 'Basic ' + window.btoa(unescape(encodeURIComponent(userName + ':' + password)));

    var defaultSettings = {
        cache: false,
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10 * 1000,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', authHeader );
        }
    };

    function init() {

        if ( initialized ) {
            return;
        }

        $$(document).on( 'ajaxStart', function(e) {
            console.log( 'ajax start' );
        });

        $$(document).on( 'ajaxError', function(e) {
            console.dir( 'err' + JSON.stringify( e ) );
        });

        $$(document).on( 'ajaxSuccess', function(e) {
            console.log( 'ajax success' );
        });

        $$(document).on( 'ajaxComplete', function(e) {
            console.log( 'ajax complete' );
        });

        initialized = true;
    }

    function ajax( verb, url, data, settings ) {
        return new Promise( function( resolve, reject ) {

            // Build base settings
            var baseSettings = _.defaults( settings, defaultSettings );

            // Add verb, url, and data
            var vud = {
                method: verb,
                url: baseUrl + url,
                data: data
            }

            var ajaxSettings = _.merge( baseSettings, vud );

            ajaxSettings.error = function( xhr, status ) {
                return reject( status );
            };

            ajaxSettings.success = function( data, status, xhr ) {
                return resolve( data );
            };

            $$.ajax( ajaxSettings );
        });
    }

    return {
        init: init,

        post: function post( url, data, settings ) {
			return ajax( 'POST', url, JSON.stringify( data ), settings );
		},

		get: function get( url, data, settings ) {
			return ajax( 'GET', url, data, settings );
		},

		patch: function patch( url, data, settings ) {
			return ajax( 'PUT', url, JSON.stringify( data ), settings );
		},

		put: function put( url, data, settings ) {
			return ajax( 'PUT', url, JSON.stringify( data ), settings );
		},

		del: function del( url, data, settings ) {
			return ajax( 'DELETE', url, JSON.stringify( data ), settings );
		}
    };

})();

TempStars.Ajax.init();
