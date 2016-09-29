
TempStars.Api = (function() {

    'use strict';

    var authToken;

    return {

        setAuthToken: function setAuthToken( at ) {
            authToken = at;
        },

        login: function login( email, password ) {
            return TempStars.Ajax.post( 'tsusers/login', { email: email, password: password });
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
                { email: email, password: password, role: role } );
        },

        saveHygienist: function saveHygienist( hygienist ) {
            return TempStars.Ajax.put( 'hygienists/' + hygienist.id + '/account', hygienist );
        },

        setupDentistAccount: function setupDentistAccount( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/account', data );
        },

        updateDentistAccount: function updateDentistAccount( dentistId, data ) {
                return TempStars.Ajax.put( 'dentists/' + dentistId + '/account', data, authToken );
        },

        resetPassword: function resetPassword( email ) {
            return TempStars.Ajax.post( 'tsusers/reset', { email: email });
        },

        getDentists: function getDentists() {
            return TempStars.Ajax.get( 'dentists', null, authToken );
        },

        getBlockedHygienists: function getBlockedHygienists( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/blockedhygienists' );
        },

        getFavouriteHygienists: function getFavouriteHygienists( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/favouritehygienists' );
        },

        addBlockedHygienist: function addBlockedHygienist( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/blockedhygienists', data  );
        },

        removeBlockedHygienist: function removeBlockedHygienist( dentistId, hygienistId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/blockedhygienists/' + hygienistId ).minDelay(1000);
        },

        addFavouriteHygienist: function addFavouriteHygienist( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/favouritehygienists', data );
        },

        removeFavouriteHygienist: function removeFavouriteHygienist( dentistId, hygienistId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/favouritehygienists/' + hygienistId ).minDelay(1000);
        },

        getDentistJobHistory: function getDentistJobHistory( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs?filter={"where":{"status":4}}' );
        },

        getHygienistJobHistory: function getHygienistJobHistory( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs?filter={"where":{"status":4}}' );
        },

        getDentistJobs: function getDentistJobs( dentistId, filter ) {
            var queryParam = (filter) ? '?filter=' + filter : '';
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs' + queryParam );
        },

        getDentistJob: function getDentistJob( dentistId, jobId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs/' + jobId );
        },

        getHygienistJobs: function getHygienistJobs( hygienistId, filter ) {
            var queryParam = (filter) ? '?filter=' + filter : '';
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs' + queryParam );
        },

        getHygienistJob: function getHygienistJob( hygienistId, jobId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs/' + jobId );
        },

        createJob: function createJob( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/jobs', data );
        },

        updateJob: function updateJob( jobId, data ) {
            return TempStars.Ajax.put( 'jobs/' + jobId, data ).minDelay(1000);
        },

        modifyJob: function modifyJob( jobId, shiftId, data ) {
            return TempStars.Ajax.put( 'jobs/' + jobId + '/shifts/' + shiftId, data ).minDelay(1000);
        },

        acceptPartialOffer: function acceptPartialOffer( jobId, poId ) {
            return TempStars.Ajax.put( 'jobs/' + jobId + '/partialoffers/' + poId + '/accept' ).minDelay(1000);
        },

        rejectPartialOffer: function rejectPartialOffer( jobId, poId, data ) {
            return TempStars.Ajax.put( 'jobs/' + jobId + '/partialoffers/' + poId, data ).minDelay(1000);
        },

        getInvoice: function getInvoice( jobId ) {
            return TempStars.Ajax.get( 'jobs/' + jobId + '/invoice' );
        },

        getDentistInvoices: function getDentistInvoices( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs?filter={"where":{"status":4}}' );
        },

        getHygienistInvoices: function getHygienistInvoices( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/jobs?filter={"where":{"status":4}}' );
        },

        updateInvoice: function updateInvoice( invoiceId, data ) {
            return TempStars.Ajax.put( 'invoices/' + invoiceId, data );
        },

        postJob: function postJob( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/jobshifts', data, authToken ).minDelay(1000);
        },

        cancelJob: function cancelJob( dentistId, jobId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/jobshifts/' + jobId ).minDelay(1000);
        },

        getBlockedDentists: function getBlockedDentists( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/blockedDentists' );
        },

        getFavouriteDentists: function getFavouriteDentists( hygienistId ) {
            return TempStars.Ajax.get( 'hygienists/' + hygienistId + '/favouriteDentists' );
        },

        removeBlockedDentist: function removeBlockedDentist( hygienistId, blockedDentistId ) {
            return TempStars.Ajax.del( 'hygienists/' + hygienistId + '/blockeddentists/' + blockedDentistId ).minDelay(1000);
        },

        removeFavouriteDentist: function removeFavouriteDentist( hygienistId, favDentistId ) {
            return TempStars.Ajax.del( 'hygienists/' + hygienistId + '/favouritedentists/' + favDentistId ).minDelay(1000);
        }
    };

})();
