
TempStars.Job = (function() {

    'use strict';

    return {

        status:  {
            'POSTED': 1,
            'PARTIAL': 2,
            'CONFIRMED': 3,
            'COMPLETED': 4
        },


        post: function post() {
            return new Promise( function( resolve, reject ) {
            });
        },

        cancel: function cancel() {
            return new Promise( function( resolve, reject ) {
            });
        },

        acceptPartialOffer: function acceptPartialOffer() {
            return new Promise( function( resolve, reject ) {
            });
        },

        modify: function modify() {
            return new Promise( function( resolve, reject ) {
            });
        }
    };
})();
