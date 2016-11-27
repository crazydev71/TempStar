
TempStars.Map = (function() {

    'use strict';

    var map,
        marker;

    return {
        init: function() {
            console.log( 'map initialized' );
        },

        displayLocation: function( lat, lon, title ) {
            var latLng = { lat: lat, lng: lon };

            if ( map === undefined ) {
                map = new google.maps.Map( document.getElementById('popover-map'), {
                    center: latLng,
                    zoom: 12,
                    fullscreenControl: false,
                    streetViewControl: false,
                    mapTypeControl: false
                });
            }
            else {
                map.setCenter( latLng );
            }

            if ( marker === undefined ) {
                marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    title: title
                });
            }
            else {
                marker.setPosition( latLng );
                marker.setTitle( title );
            }
        }
    };
})();
