
TempStars.Hygienist = (function() {
    'use strict';

    var lastJobIdViewed;

    return {

        save: function save( data ) {
            return TempStars.Api.saveHygienist( data );
        },

        getMaxAvailableJobId: function getMaxAvailableJobId() {
            return TempStars.Api.getMaxAvailableJobId( TempStars.User.getCurrentUser().hygienistId );
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

        saveDentistRating: function saveDentistRating( jobId, rating ) {
            app.showPreloader('Saving Survey');
            TempStars.Api.saveDentistRating( TempStars.User.getCurrentUser().hygienistId, jobId, rating )
            .then( function() {
                app.hidePreloader();
                TempStars.Hygienist.Router.reloadPage('', { id: jobId });
            })
            .catch( function(err) {
                app.hidePreloader();
                app.alert( 'Error saving survey. Please try again.' );
            });
        },

        surveyButtonHandler: function surveyButtonHandler( e, job ) {
            var title = "Rate the Dental Office";
            var text = 
                job.dentist.practiceName + '<br>' +
                moment( job.shifts[0].shiftDate ).local().format('MMM D, ') + 
                moment.utc( job.shifts[0].postedStart ).local().format('h:mm a') + ' - ' +
                moment.utc( job.shifts[0].postedEnd ).local().format('h:mm a') + '<br><br>' +
                'How happy would you be to work at this office again?';

            app.modal({
                title: title,
                text: text,
                verticalButtons: true,
                buttons: [
                    {
                        text: 'Very Happy',
                        onClick: function() {
                            app.alert('Great, they will be added to your Favourites!', function() {
                                TempStars.Hygienist.saveDentistRating( job.id, TempStars.Rating.VERY_HAPPY );
                            });
                        }
                    },
                    {
                        text: 'Pleased',
                        onClick: function() {
                            app.alert('Good to hear!', function() {
                                TempStars.Hygienist.saveDentistRating( job.id, TempStars.Rating.PLEASED );
                            });
                        }
                    },
                    {
                        text: 'No Thank You!',
                        onClick: function() {
                            app.alert('Sorry to hear that, we will not sent you any of their future job posting notifications.', function() {
                                TempStars.Hygienist.saveDentistRating( job.id, TempStars.Rating.NO_THANK_YOU );
                            });
                        }
                    }
                ]
            });
        },

        gotoInvoicePage: function gotoInvoicePage(invoiceData) {
            app.modal({
                text: 'When creating your invoice, bill only for the hours you worked. To prevent misunderstandings, confirm your invoice details with the office manager before submitting your invoice.  Invite Bonuses are paid directly by TempStars, not included in the job invoice rate.',
                title: 'Important:',
                buttons: [
                    {
                        text: 'Got it!',
                        bold: true,
                        onClick: function() {
                            TempStars.Hygienist.Router.goForwardPage( 'create-invoice', {}, invoiceData );
                        }
                    }
                ]
            });
        }

    };
})();
