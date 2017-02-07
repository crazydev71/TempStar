
TempStars.Dentist.Menu = (function() {

    'use strict';

    function init() {

        $$(document).on( 'click', '.dentist-internal-forward', function(e) {

            e.preventDefault();
            var page = $$(this).attr('data-page');
            var access = $$(this).attr('data-access');

            if ( access != 'payment-info-required' ) {
                TempStars.Dentist.Router.goForwardPage( page );
                return;
            }

            if ( TempStars.User.getCurrentUser().dentist.stripeCustomerId ) {
                TempStars.Dentist.Router.goForwardPage( page );
            }
            else {
                app.modal({
                title:  'Payment Info Required',
                text: 'While it\'s 100% free to hire a TempStars hygienist, using this feature requires ' +
                      'that you have your payment information completed. You won\'t be charged for this service. ' +
                      '<br><br>Would you like to enter your payment information now?',
                  buttons: [
                    {
                        text: 'Yes',
                        onClick: function() {
                            $$('.modal').hide();
                            TempStars.Dentist.Router.goForwardPage( 'payment-info', { nextPage: page } );
                        }
                    },
                    {
                        text: 'No'
                    }
                  ]
                });
            }
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
