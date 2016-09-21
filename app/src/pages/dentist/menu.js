
TempStars.Dentist.Menu = (function() {

    'use strict';

    function init() {

        $$(document).on( 'click', '.internal', function(e) {

            e.preventDefault();

            var url = $$(this).attr('data-url');
            var back = $$(this).hasClass('detailback');
            var reload = $$(this).hasClass('reload');

            console.log( 'menu get data for url: ' + url );
            getData( url )
            .then( function( data ) {
                console.log( 'loading url: ' + url );
                if ( back ) {
                    mainView.router.back({
                        url: url,
                        context: data,
                        ignoreCache: true,
                        reload: false
                    });
                }
                else {
                    mainView.router.load({
                        url: url,
                        context: data,
                        ignoreCache: true,
                        reload: reload
                        // reloadPrevious: true
                    });
                }
            })
            .catch( function( err ) {
                console.log( 'error getting data for: ' + url );
            });

        });
    }

    function getData( url ) {

        switch( url ) {

            case 'dentist/home.html':
                return TempStars.Pages.Dentist.Home.getData();
                break;

            case 'dentist/post-job.html':
                return TempStars.Pages.Dentist.PostJob.getData();
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

            case 'dentist/terms-of-service.html':
                return TempStars.Pages.Dentist.TermsOfService.getData();
                break;

            case 'dentist/privacy-policy.html':
                return TempStars.Pages.Dentist.PrivacyPolicy.getData();
                break;

            default:
                return Promise.resolve({});
                break;
        }
    }

    // function logout() {
    //     app.confirm( 'Are you sure you want to log out?', TempStars.Menu.logout );
    // }


    return {
        init: init
    };

})();

TempStars.Dentist.Menu.init();
