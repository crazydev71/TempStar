
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

        getJobs: function getJobs( dentistId ) {
            return TempStars.Ajax.get( 'dentists/' + dentistId + '/jobs' );
        },

        createJob: function createJob( dentistId, data ) {
            return TempStars.Ajax.post( 'dentists/' + dentistId + '/jobs', data );
        },

        updateJob: function updateJob( dentistId, data ) {
            return TempStars.Ajax.put( 'dentists/' + dentistId + '/jobs', data );
        },

        deleteJob: function deleteJob( dentistId, data ) {
            return TempStars.Ajax.del( 'dentists/' + dentistId + '/jobs', data );
        },

        getInvoice: function getInvoice( jobId ) {
            return TempStars.Ajax.post( 'jobs/' + jobId + '/invoice', data );
        },

        updateInvoice: function updateInvoice( invoiceId, data ) {
            return TempStars.Ajax.put( 'invoices/' + invoiceId, data );
        }
        
    };

})();
