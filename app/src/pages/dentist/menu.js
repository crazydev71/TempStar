
TempStars.Dentist.Menu = (function() {

    'use strict';

    function init() {

        $$(document).on( 'click', '.dentist-internal-forward', function(e) {

            e.preventDefault();
            var page = $$(this).attr('data-page');
            TempStars.Dentist.Router.goForwardPage( page );
        });

        $$(document).on( 'click', '.dentist-internal-back', function(e) {
            var page,
                id,
                params;

            e.preventDefault();

            page = $$(this).attr('data-page');
            id = $$(this).attr('data-id');
            if ( id ) {
                params = { id: id };
            }
            TempStars.Dentist.Router.goBackPage( page, params );
        });
    }

    return {
        init: init
    };

})();

TempStars.Dentist.Menu.init();
