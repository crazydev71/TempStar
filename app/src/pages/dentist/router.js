
TempStars.Dentist.Router = (function() {

    'use strict';

    var router;

    function init() {
        router = TempStars.Router.init( 'dentist' );
    }

    function goForwardPage( page, params, data ) {
        router.goForwardPage( page, params, data );
    }

    function goBackPage( page, params, data ) {
        router.goBackPage( page, params, data );
    }

    function reloadPage( page, params, data ) {
        router.reloadPage( page, params, data );
    }


    return {
        init: init,
        goForwardPage: goForwardPage,
        goBackPage: goBackPage,
        reloadPage: reloadPage
    };

})();

TempStars.Dentist.Router.init();
