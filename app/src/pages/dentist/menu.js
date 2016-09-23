
TempStars.Dentist.Menu = (function() {

    'use strict';

    function init() {

        $$(document).on( 'click', '.internal-forward', function(e) {

            e.preventDefault();
            var page = $$(this).attr('data-page');
            TempStars.Dentist.Router.goForwardPage( page );
        });

        $$(document).on( 'click', '.internal-back', function(e) {

            e.preventDefault();
            var page = $$(this).attr('data-page');
            TempStars.Dentist.Router.goBackPage( page );
        });
    }

    return {
        init: init
    };

})();

TempStars.Dentist.Menu.init();
