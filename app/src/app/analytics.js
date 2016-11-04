
TempStars.Analytics = (function() {

    'use strict';

    var _LTracker;

    function init() {
        mixpanel.init( TempStars.Config.mixpanel.token, {persistence: 'localStorage'} );
    }

    function identify( id ) {
        mixpanel.identify( id );
    }

    function track( eventName, props ) {
        mixpanel.track( eventName, props );
    }

    function alias( alias, original ) {
        mixpanel.alias( alias, original );
    }

    function setProfileProperties( props ) {
        mixpanel.people.set( props );
    }

    return {
        init: init,
        identify: identify,
        track : track,
        alias: alias,
        setProfileProperties: setProfileProperties
    };

})();
