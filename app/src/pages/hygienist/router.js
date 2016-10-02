

TempStars.Hygienist.Router = (function() {

    'use strict';

    var router;

    function init() {
        router = new TempStars.Router( 'hygienist' );
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

TempStars.Hygienist.Router.init();
