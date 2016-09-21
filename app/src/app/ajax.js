
// works for android emulator $$.getJSON('http://10.0.2.2:3000/api/Dentists', function( serverData )
// works for everythig locally $$.getJSON('http://10.0.1.45:3000/api/Dentists', function( serverData )
//$$.getJSON('https://riff:raff@api.tempstars.net/api/Dentists', function( serverData )

TempStars.Ajax = (function() {
    'use strict';

    var initialized = false;
    var baseUrl = TempStars.Config.server.baseUrl;

    var defaultSettings = {
        cache: false,
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10 * 1000
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

    function ajax( verb, url, data, auth, settings ) {
        return new Promise( function( resolve, reject ) {

            // Build base settings
            var baseSettings = _.defaults( settings, defaultSettings );

            // Add verb, url, and data
            var vud = {
                method: verb,
                url: baseUrl + url
            };
            
            if ( data ) {
                vud.data = data;
            }
            var ajaxSettings = _.merge( baseSettings, vud );

            // Add authorization header if provided
            if ( auth ) {
                ajaxSettings.beforeSend = function(xhr) {
                    xhr.setRequestHeader('Authorization', auth );
                };
            }

            // Add error and success handlers
            ajaxSettings.error = function( xhr, status ) {
                reject( xhr.responseJSON );
            };

            ajaxSettings.success = function( data, status, xhr ) {
                resolve( data );
            };

            $.ajax( ajaxSettings );
        });
    }

    return {
        init: init,

        post: function post( url, data, auth, settings ) {
			return ajax( 'POST', url, JSON.stringify( data ), auth, settings );
		},

		get: function get( url, data, auth, settings ) {
			return ajax( 'GET', url, data, auth, settings );
		},

		patch: function patch( url, data, auth, settings ) {
			return ajax( 'PUT', url, JSON.stringify( data ), auth, settings );
		},

		put: function put( url, data, auth, settings ) {
			return ajax( 'PUT', url, JSON.stringify( data ), auth, settings );
		},

		del: function del( url, data, auth, settings ) {
			return ajax( 'DELETE', url, JSON.stringify( data ), auth, settings );
		}
    };

})();

TempStars.Ajax.init();
