
TempStars.Hygienist.Menu = (function() {

    'use strict';

    function init() {

        $$(document).on( 'click', '.hygienist-internal-forward', function(e) {

            e.preventDefault();
            var page = $$(this).attr('data-page');
            TempStars.Hygienist.Router.goForwardPage( page );
        });

        $$(document).on( 'click', '.hygienist-internal-back', function(e) {
            var page,
                id,
                params;

            e.preventDefault();

            page = $$(this).attr('data-page');
            id = $$(this).attr('data-id');
            if ( id ) {
                params = { id: id };
            }
            TempStars.Hygienist.Router.goBackPage( page, params );
        });
    }

    return {
        init: init
    };

})();

TempStars.Hygienist.Menu.init();
