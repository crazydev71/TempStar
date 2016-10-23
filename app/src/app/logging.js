
TempStars.Logging = (function() {

    'use strict';

    var _LTracker;

    function init() {
        _LTracker = window._LTracker || [];
        _LTracker.push({ 'logglyKey': TempStars.Config.loggly.key,
        'sendConsoleErrors' : false,
        'tag' : TempStars.Config.env.name });
    }

    function log( message ) {
        var data =  {};

        data.msg = message;
        data.device = window.device;
        data.version = TempStars.version;

        var user = TempStars.User.getCurrentUser();
        data.user = {};
        if ( user ) {
            data.user.id = user.id;
            data.user.email = user.email;            
        }

        _LTracker.push( data );
    }

    return {
        init: init,
        log : log
    };

})();

TempStars.Logging.init();
