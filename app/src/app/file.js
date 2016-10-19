
TempStars.File = (function() {

    'use strict';

    return {
        convertDataURItoBlobSync: function convertDataURItoBlobSync( dataURI ) {
            var byteString, content, mimestring;
            if ( dataURI.split( "," )[ 0 ].indexOf( "base64" ) !== -1 ) {
                byteString = atob( dataURI.split( "," )[ 1 ] );
            } else {
                byteString = decodeURI( dataURI.split( "," )[ 1 ] );
            }
            mimestring = dataURI.split( "," )[ 0 ].split( ":" )[ 1 ].split( ";" )[ 0 ];
            content = [];
            for ( var i = 0; i < byteString.length; i++ ) {
                content[ i ] = byteString.charCodeAt( i );
            }
            var rawContent = new Uint8Array( content ), returnBlob = new Blob( [ rawContent ], { type: mimestring } );
            return returnBlob;
        }
    };
})();
