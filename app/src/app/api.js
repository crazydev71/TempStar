
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

        removeBlockedHygienist: function removeBlockedHygienist( dentistId, hygienistId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/blockedhygienists/' + hygienistId );
        },

        removeFavouriteHygienist: function removeFavouriteHygienist( dentistId, hygienistId ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/favouritehygienists/' + hygienistId );
        },

        getJobHistory: function getJobHistory( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs?filter={"where":{"status":{"gt":6}}}' );
        },

        createJob: function createJob( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/jobs', data );
        },

        updateJob: function updateJob( jobId, data ) {
            return TempStars.Ajax.put( 'jobs/' + jobId, data );
        },

        deleteJob: function deleteJob( dentistId, data ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/jobs', data );
        },

        getInvoice: function getInvoice( jobId ) {
            return TempStars.Ajax.get( 'jobs/' + jobId + '/invoice' );
        },

        getInvoices: function getInvoices( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs?filter={"where":{"status":{"gt":6}}}' );
        },

        updateInvoice: function updateInvoice( invoiceId, data ) {
            return TempStars.Ajax.put( 'invoices/' + invoiceId, data );
        },

        postJob: function postJob( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/jobshifts', data, authToken ).minDelay(1000);
        }

    };

})();
