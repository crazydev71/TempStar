
TempStars.Router = (function() {
    var area,
        urlPath,
        classPath;

    function init( a ) {
        area = a;
        urlPath = _.toLower( a );
        classPath = _.upperFirst( a );
        return this;
    }

    function goForwardPage( page, params, data ) {
        goPage( 'forward', page, params, data );
    }

    function goBackPage( page, params, data ) {
        goPage( 'back', page, params, data );
    }

    function goPage( direction, page, params, data ) {

        var moduleName = _.upperFirst( _.camelCase( page ));
        var url = page + '.html';

        params = params || {};

        // If page has slash, don't assume it is in dentist
        if ( page.indexOf('/') == -1 ) {
            url = urlPath + '/' + url;
        }

        var options = {
            url: url,
            context: data,
            ignoreCache: true,
            reload: false
        };

        // If we have the data, use it
        if ( data ) {
            if ( direction == 'forward' ) {
                mainView.router.load( options );
            }
            else {
                mainView.router.back( options );
            }
            return;
        }

        // If we don't have the data, get it
        TempStars.Pages[classPath][moduleName].getData( params )
        .then( function( data ) {
            options.context = data;
            if ( direction == 'forward' ) {
                mainView.router.load( options );
            }
            else {
                options.force = true;
                options.reloadPrevious = false;
                mainView.router.back( options );
            }
        })
        .catch( function( err ) {
            console.log( 'error going to page ' + page );
        });
    }

    return {
        init: init,
        goForwardPage: goForwardPage,
        goBackPage: goBackPage
    };

})();


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


    return {
        init: init,
        goForwardPage: goForwardPage,
        goBackPage: goBackPage
    }
})();

TempStars.Dentist.Router.init();
