
TempStars.Hygienist = (function() {
    'use strict';

    return {
        save: function save( data ) {
            return TempStars.Api.saveHygienist( data );
        },

        getJobsByDate: function getJobByDate( date ) {
            var filter = {where: {startDate: date }};
            var filterString = JSON.stringify( filter );
            return TempStars.Api.getHygienistJobs( TempStars.User.getCurrentUser().hygienistId, filterString );
        },

        getJobsByDentist: function getJobsByDentist( dentistId ) {
            var filter = {where: {dentistId: dentistId }};
            var filterString = JSON.stringify( filter );
            return TempStars.Api.getHygienistJobs( TempStars.User.getCurrentUser().hygienistId, filterString );
        },

        getAllJobs: function getAllJobs() {
            return Promise.props({
                jobs: TempStars.Api.getHygienistJobs( TempStars.User.getCurrentUser().hygienistId ),
                pos: TempStars.Api.getHygienistPartialOffers( TempStars.User.getCurrentUser().hygienistId )
            });
        },

        getJob: function getJob( jobId ) {
            return TempStars.Api.getHygienistJob( TempStars.User.getCurrentUser().hygienistId, jobId );
        },

        getPartialOfferByDate: function getPartialOfferByDate( date ) {
            var filter = {where: {startDate: date }};
            var filterString = JSON.stringify( filter );
            return TempStars.Api.getHygienistJobs( TempStars.User.getCurrentUser().hygienistId, filterString );
        },


    };
})();
