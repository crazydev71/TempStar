
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

        rateDentist: function rateDentist( jobId, rating ) {
            app.showPreloader('Saving Survey');
            TempStars.Api.rateDentist( TempStars.User.getCurrentUser().hygienistId, jobId, rating )
            .then( function() {
                app.hidePreloader();
                TempStars.Hygienist.Router.reloadPage();
            })
            .catch( function(err) {
                app.hidePreloader();
                app.alert( 'Error saving survey. Please try again.' );
            });
        },

        surveyButtonHandler: function surveyButtonHandler( e, jobId ) {
            app.modal({
              title:  'Rate Dental Office',
              text: 'How happy would you be to work at this office again?',
              verticalButtons: true,
              buttons: [
                {
                    text: 'Very Happy',
                    onClick: function() {
                        app.alert('Great, they will be added to your favourites.', function() {
                            TempStars.Hygienist.rateDentist( jobId, TempStars.Rating.VERY_HAPPY );
                        });
                    }
                },
                {
                    text: 'Pleased',
                    onClick: function() {
                        app.alert('Thanks, all set.', function() {
                            TempStars.Hygienist.rateDentist( jobId, TempStars.Rating.PLEASED );
                        });
                    }
                },
                {
                    text: 'No Thank You!',
                    onClick: function() {
                        app.alert('Sorry, they will be added to your blocked list.', function() {
                            TempStars.Hygienist.rateDentist( jobId, TempStars.Rating.NO_THANK_YOU );
                        });
                    }
                }
              ]
            });
        }

    };
})();
