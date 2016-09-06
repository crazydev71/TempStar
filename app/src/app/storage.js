
TempStars.Storage = (function() {
    'use strict';

    return {

        set: function set( key, value ) {
            return new Promise( function( resolve, reject ) {
                if ( ! window.cordova ) {
                    localStorage.setItem( key, JSON.stringify(value) );
                    resolve();
                }
                else {
                    NativeStorage.setItem( key, value,
                        function( obj ) {
                            resolve( obj );
                        },
                        function( err ) {
                            reject( err );
                        }
                    );
                }
            });
        },

        get: function get( key ) {
            return new Promise( function( resolve, reject ) {
                if ( ! window.cordova ) {
                    var val = localStorage.getItem( key );
                    if ( val == null ) {
                        reject();
                    }
                    else {
                        val = JSON.parse( val );
                        resolve( val );
                    }
                }
                else {
                    NativeStorage.getItem( key,
                        function( obj ) {
                            resolve( obj );
                        },
                        function( err ) {
                            reject( err );
                        }
                     );
                 }
            });
        },

        remove: function remove( key ) {
            return new Promise( function( resolve, reject ) {
                if ( ! window.cordova ) {
                    localStorage.removeItem( key );
                    resolve();
                }
                else {
                    NativeStorage.remove( key,
                        function() {
                            resolve();
                        },
                        function( err ) {
                            reject( err );
                        }
                    );
                }
            });
        },

        clear: function clear() {
            return new Promise( function( resolve, reject ) {
                if ( ! window.cordova ) {
                    localStorage.clear();
                    resolve();
                }
                else {
                    NativeStorage.clear(
                        function() {
                            resolve();
                        },
                        function( err ) {
                            reject( err );
                        }
                    );
                }
            });
        }

    };

})();
