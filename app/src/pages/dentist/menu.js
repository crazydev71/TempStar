
TempStars.Dentist.Menu = (function() {

    'use strict';

    function init() {

        $$(document).on( 'click', '.internal', function(e) {

            e.preventDefault();

            var url = $$(this).attr('data-url');
            getData( url )
            .then( function( data ) {
                mainView.router.load({
                    url: url,
                    context: data,
                    ignoreCache: true,
                    reload: true
                });
            })
            .catch( function( err ) {
                console.log( 'error getting data for: ' + url );
            });

        });
    }

    function getData( url ) {
        var data;

        switch( url ) {

            case 'dentist/home.html':
                return TempStars.Pages.Dentist.Home.getData();
                break;

            case 'dentist/profile.html':
                return TempStars.Pages.Dentist.Profile.getData();
                break;

            case 'dentist/jobs.html':
                return TempStars.Pages.Dentist.Jobs.getData();
                break;

            case 'dentist/invoices.html':
                return TempStars.Pages.Dentist.Invoices.getData();
                break;

            case 'dentist/hygienists.html':
                return TempStars.Pages.Dentist.Hygienists.getData();
                break;

            case 'dentist/support.html':
                return TempStars.Pages.Dentist.Support.getData();
                break;

            default:
                return Promise.resolve({});
                break;
        }
    }

    function logout() {
        app.confirm( 'Are you sure you want to log out?', TempStars.Menu.logout );
    }


    return {
        init: init
    };

})();

TempStars.Dentist.Menu.init();
