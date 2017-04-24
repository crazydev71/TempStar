
TempStars.Api = (function() {

    'use strict';

    var authToken;

    return {

        setAuthToken: function setAuthToken( at ) {
            authToken = at;
        },

        getAuthToken: function getAuthToken() {
            return authToken;
        },

        login: function login( email, password ) {
            return TempStars.Ajax.post( 'tsusers/login', { email: email, password: password, ttl: 31556926 });
        },

        logout: function logout() {
            return TempStars.Ajax.post( 'tsusers/logout', { access_token: authToken }, authToken );
        },

        getUserAccount: function getUserAccount() {
            return TempStars.Ajax.get('tsusers/me', null, authToken );
        },

        getDentist: function getDentist() {
            return TempStars.Ajax.get('tsusers/me/dentist', null, authToken );
        },

        getHygienist: function getHygienist() {
            return TempStars.Ajax.get('tsusers/me/hygienist', null, authToken );
        },

        // Create user, adds role, and logs user in; returns auth object (like login method)
        createAccount: function createAccount( email, password, role ) {
            return TempStars.Ajax.post( 'tsusers/account',
                { email: email, password: password, role: role }, authToken );
        },

        getUserByInvite: function getUserByInvite( inviteCode ) {
            return TempStars.Ajax.get( 'tsusers?filter[where][inviteCode]='+inviteCode, null, authToken );
        },

        addInvite: function addInvite(userId,inviteCode){
            return TempStars.Ajax.post( 'invites',
                { invitedUserId: userId, inviteCode: inviteCode, status: 0, userOnPlacement:0 }, authToken );
        },

        saveHygienist: function saveHygienist( hygienist ) {
            return TempStars.Ajax.put( 'hygienists/' + hygienist.id + '/account', hygienist, authToken );
        },

        setupDentistAccount: function setupDentistAccount( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/account', data, authToken );
        },

        addPaymentInfo: function addPaymentInfo( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/account/payment', data, authToken );
        },

        updateDentistAccount: function updateDentistAccount( dentistId, data ) {
            return TempStars.Ajax.put( 'dentists/' + dentistId + '/account', data, authToken );
        },

        updateHygienistAccount: function updateHygienistAccount( hygienistId, data ) {
            return TempStars.Ajax.put( 'hygienists/' + hygienistId + '/account', data, authToken );
        },

        resetPassword: function resetPassword( email ) {
            return TempStars.Ajax.post( 'tsusers/reset', { email: email }, authToken );
        },

        getDentists: function getDentists() {
            return TempStars.Ajax.get( 'dentists', null, authToken );
        },

        getBlockedHygienists: function getBlockedHygienists( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/blockedhygienists', null, authToken );
        },

        getFavouriteHygienists: function getFavouriteHygienists( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/favouritehygienists', null, authToken );
        },

        addBlockedHygienist: function addBlockedHygienist( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/blockedhygienists', data, authToken );
        },

        removeBlockedHygienist: function removeBlockedHygienist( dentistId, hygienistId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/blockedhygienists/' + hygienistId,
                null, authToken ).minDelay(1000);
        },

        addFavouriteHygienist: function addFavouriteHygienist( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/favouritehygienists', data, authToken );
        },

        removeFavouriteHygienist: function removeFavouriteHygienist( dentistId, hygienistId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/favouritehygienists/' + hygienistId,
                null, authToken ).minDelay(1000);
        },

        getDentistJobHistory: function getDentistJobHistory( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs?filter={"where":{"status":4}}',
                null, authToken );
        },

        getHygienistJobHistory: function getHygienistJobHistory( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs?filter={"where":{"status":4}}',
                null, authToken );
        },

        getDentistJobs: function getDentistJobs( dentistId, filter ) {
            var queryParam = (filter) ? '?filter=' + filter : '';
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs' + queryParam,
                null, authToken );
        },

        getDentistJob: function getDentistJob( dentistId, jobId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs/' + jobId,
                null, authToken );
        },

        getHygienistJobs: function getHygienistJobs( hygienistId, filter ) {
            var queryParam = (filter) ? '?filter=' + filter : '';
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs' + queryParam,
                null, authToken );
        },

        getHygienistJob: function getHygienistJob( hygienistId, jobId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs/' + jobId,
                null, authToken );
        },

        createJob: function createJob( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/jobs', data, authToken );
        },

        updateJob: function updateJob( jobId, data ) {
            return TempStars.Ajax.put( 'jobs/' + jobId, data, authToken ).minDelay(1000);
        },

        modifyJob: function modifyJob( dentistId, jobId, data ) {
            return TempStars.Ajax.put( 'dentists/' + dentistId + '/jobshifts/' + jobId, data, authToken ).minDelay(1000);
        },

        acceptPartialOffer: function acceptPartialOffer( jobId, poId ) {
            return TempStars.Ajax.put( 'jobs/' + jobId + '/partialoffers/' + poId + '/accept',
                null, authToken ).minDelay(1000);
        },

        rejectPartialOffer: function rejectPartialOffer( jobId, poId ) {
            return TempStars.Ajax.put( 'jobs/' + jobId + '/partialoffers/' + poId + '/reject',
                null, authToken ).minDelay(1000);
        },

        getInvoice: function getInvoice( jobId ) {
            return TempStars.Ajax.get( 'jobs/' + jobId + '/invoice', null, authToken );
        },

        getDentistInvoices: function getDentistInvoices( dentistId ) {
            return new Promise( function( resolve, reject ) {
                TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs?filter={"where":{"status":4}}',
                    null, authToken )
                .then( function( data ) {
                    data = _.filter(data, function(o) {
                        return ( 'invoice' in o );
                    });
                    resolve( data );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        },

        getHygienistInvoices: function getHygienistInvoices( hygienistId ) {
            return new Promise( function( resolve, reject ) {
                TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs?filter={"where":{"status":4}}',
                    null, authToken )
                .then( function( data ) {
                    data = _.filter(data, function(o) {
                        return ( 'invoice' in o );
                    });
                    resolve( data );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });

        },

        updateInvoice: function updateInvoice( invoiceId, data ) {
            return TempStars.Ajax.put( 'invoices/' + invoiceId, data, authToken );
        },

        sendInvoice: function sendInvoice( jobId, data ) {
            return TempStars.Ajax.post( 'jobs/' + jobId + '/invoices/send', data, authToken ).minDelay(1000);
        },

        resendInvoice: function resendInvoice( jobId, data ) {
            return TempStars.Ajax.put( 'jobs/' + jobId + '/resend', data, authToken ).minDelay(1000);
        },

        postJob: function postJob( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/jobshifts', data, authToken ).minDelay(1000);
        },

        cancelJob: function cancelJob( dentistId, jobId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/jobshifts/' + jobId,
                null, authToken ).minDelay(1000);
        },

        hygienistCancelJob: function hygienistCancelJob( hygienistId, jobId ) {
            return TempStars.Ajax.del( 'hygienists/' + hygienistId + '/jobshifts/' + jobId,
                null, authToken ).minDelay(1000);
        },

        bookJob: function bookJob( hygienistId, jobId, lastModifiedOn ) {
            return TempStars.Ajax.put( 'hygienists/' + hygienistId + '/jobs/' + jobId + '/book',
           {lastModifiedOn: lastModifiedOn}, authToken ).minDelay(1000);
        },

        updateInviteStatus: function updateInviteStatus( hygienistId ) {
            return TempStars.Ajax.put( 'hygienists/' + hygienistId + '/updateInviteStatus',
           {}, authToken ).minDelay(1000);
        },

        makePartialOffer: function makePartialOffer( hygienistId, jobId, data ) {
            return TempStars.Ajax.post( 'hygienists/' + hygienistId + '/jobs/' + jobId + '/partialoffer',
                data, authToken ).minDelay(1000);
        },

        modifyPartialOffer: function modifyPartialOffer( partialOfferId, data ) {
            return TempStars.Ajax.put( 'partialoffers/' + partialOfferId, data, authToken ).minDelay(1000);
        },

        cancelPartialOffer: function cancelPartialOffer( hygienistId, jobId, partialOfferId ) {
            return TempStars.Ajax.del( 'hygienists/' + hygienistId + '/jobs/' + jobId + '/partialoffers/' + partialOfferId,
                null, authToken ).minDelay(1000);
        },

        getHygienistPartialOffers: function getHygienistPartialOffers( hygienistId ) {
            return TempStars.Ajax.get( 'partialoffers?filter={"include": "job","where":{"hygienistId":' + hygienistId + ',"status":0}}',
                null, authToken ).minDelay(1000);
        },

        getBlockedDentists: function getBlockedDentists( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/blockeddentists',
                null, authToken );
        },

        getFavouriteDentists: function getFavouriteDentists( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/favouritedentists',
                null, authToken );
        },

        removeBlockedDentist: function removeBlockedDentist( hygienistId, blockedDentistId ) {
            return TempStars.Ajax.del( 'hygienists/' + hygienistId + '/blockeddentists/' + blockedDentistId,
                null, authToken ).minDelay(1000);
        },

        removeFavouriteDentist: function removeFavouriteDentist( hygienistId, favDentistId ) {
            return TempStars.Ajax.del( 'hygienists/' + hygienistId + '/favouritedentists/' + favDentistId,
                null, authToken ).minDelay(1000);
        },

        addBlockedDentist: function addBlockedDentist( hygienistId, data ) {
            return TempStars.Ajax.post( 'hygienists/' + hygienistId + '/blockeddentists', data, authToken );
        },

        addFavouriteDentist: function addFavouriteDentist( hygienistId, data ) {
            return TempStars.Ajax.post( 'hygienists/' + hygienistId + '/favouritedentists', data, authToken );
        },

        getAvailableJobs: function getAvailableJobs( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs/available', null, authToken );
        },

        getJob: function getJob( jobId ) {
            return TempStars.Ajax.get( 'jobs/' + jobId, null, authToken );
        },

        updateRegistration: function updateRegistration( userId, platform, registrationId ) {
            return TempStars.Ajax.put( 'tsusers/' + userId, { platform: platform, registrationId: registrationId }, authToken );
        },

        saveHygienistRating: function saveHygienistRating( dentistId, jobId, data ) {
            return TempStars.Ajax.put( 'dentists/' + dentistId + '/jobs/' + jobId,
                data, authToken ).minDelay(1000);
        },

        getMaxAvailableJobId: function getMaxAvailableJobId( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/maji', null, authToken );
        },

        saveDentistRating: function saveDentistRating( hygienistId, jobId, rating ) {
            var data = { rating: rating };
            return TempStars.Ajax.put( 'hygienists/' + hygienistId + '/jobs/' + jobId,
                data, authToken ).minDelay(1000);
        },

        sendResumes: function sendResumes( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/resumes',
                data, authToken ).minDelay(1000);
        },

        getHygienistRate: function getHygienistRate( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/rate', null, authToken );
        },

        getMinVersion: function getMinVersion() {
            return TempStars.Ajax.get( 'minVersion' );
        },

        sendInvite: function sendInvite(userId, data) {
            return TempStars.Ajax.put( 'hygienists/' + userId + '/sendInvite', data, authToken );
        }

    };

})();
