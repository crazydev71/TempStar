
TempStars.Analytics = (function() {

    'use strict';

    var _LTracker;

    function init() {
        if ( TempStars.Config.mixpanel.enabled ) {
            mixpanel.init( TempStars.Config.mixpanel.token, {persistence: 'localStorage'} );
        }
    }

    function identify( id ) {
        if ( TempStars.Config.mixpanel.enabled ) {
            mixpanel.identify( id );
        }
    }

    function track( eventName, props ) {
        if ( TempStars.Config.mixpanel.enabled ) {
            mixpanel.track( eventName, props );
        }
    }

    function alias( alias, original ) {
        if ( TempStars.Config.mixpanel.enabled ) {
            mixpanel.alias( alias, original );
        }
    }

    function setProfileProperties( props ) {
        if ( TempStars.Config.mixpanel.enabled ) {
            mixpanel.people.set( props );
        }
    }

    return {
        init: init,
        identify: identify,
        track : track,
        alias: alias,
        setProfileProperties: setProfileProperties
    };

})();
