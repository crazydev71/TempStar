
TempStars.Router = function( a ) {

    'use strict';

        var area,
            urlPath,
            classPath;

        area = a;
        urlPath = _.toLower( a );
        classPath = _.upperFirst( a );

        var goPage = function( direction, page, params, data ) {

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

                if ( params.reload ) {
                    options.reload = params.reload;
                }

                // If we have the data, use it
                if ( data ) {
                    if ( direction == 'forward' ) {
                        mainView.router.load( options );
                        if ( params.nohistory ) {
                            mainView.history.pop();
                        }
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
                        //options.reload = true;
                        mainView.router.load( options );
                        if ( params.nohistory ) {
                            mainView.history.pop();
                        }                        
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
        };

        this.goForwardPage = function( page, params, data ) {
            goPage( 'forward', page, params, data );
        };

        this.goBackPage = function( page, params, data ) {
            var len,
                previousPageIndex,
                url;

            // If page wasn't provided, pull from history
            if ( ! page ) {
                len = mainView.history.length;
                previousPageIndex = (len >= 2) ? len - 2 : 0;
                url = document.createElement('a');
                url.href = mainView.history[previousPageIndex];
                page = url.pathname.split('/').reverse()[0].replace('.html', '');
            }

            goPage( 'back', page, params, data );
        };

        this.reloadPage = function( page, params, data ) {
            var url;

            params = params || {};
            params.reload = true;

            // If page wasn't provided, pull from history
            if ( ! page ) {
                url = document.createElement('a');
                url.href = mainView.history[mainView.history.length - 1];
                page = url.pathname.split('/').reverse()[0].replace('.html', '');
            }

            goPage( 'forward', page, params, data );
        };

};
