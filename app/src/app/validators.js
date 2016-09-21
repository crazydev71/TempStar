
TempStars.Validators = (function() {
    'use strict';
    
    return {
        validatePostalCode: function validatePostalCode(value, options, key, attributes) {
            if ( value.match( /^([ABCEGHJKLMNPRSTVXY][0-9][A-Z][ ]?[0-9][A-Z][0-9])*$/ ) ) {
                // if matches return null for no error
                return null;
            }
            else {
                return "is invalid";
            }
        },

        validatePhoneNumber: function validatePhoneNumber(value, options, key, attributes) {

            if ( value.match( /^(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?$/ ) ) {
                // if matches return null for no error
                return null;
            }
            else {
                return "is invalid";
            }
        },

        validateCreditCardNumber: function validatePhoneNumber(value, options, key, attributes) {
            if ( Stripe.card.validateCardNumber( value ) ) {
                return null;
            }
            else {
                return "is invalid";
            }
        },

        validateCreditCardExpiryDate: function validateCreditCardExpiryDate(value, options, key, attributes) {
            if ( Stripe.card.validateExpiry( value ) ) {
                return null;
            }
            else {
                return "is invalid";
            }
        },

        validateCreditCardCVC: function validateCreditCardCVC(value, options, key, attributes) {
            if ( Stripe.card.validateCVC( value ) ) {
                return null;
            }
            else {
                return "is invalid";
            }
        },

        validatePostalCodeIsOntario: function validatePostalCodeIsOntario(value, options, key, attributes) {
            var firstLetter = value.substr(0,1);
            if ( firstLetter.match(/[KLMNP]/) ) {
                return null;
            }
            else {
                return "is not in Ontario";
            }
        }

    };

})();

// Add to global validator
validate.validators.postalCode = TempStars.Validators.validatePostalCode;
validate.validators.phoneNumber = TempStars.Validators.validatePhoneNumber;
validate.validators.creditCardNumber = TempStars.Validators.validateCreditCardNumber;
validate.validators.creditCardExpiryDate = TempStars.Validators.validateCreditCardExpiryDate;
validate.validators.creditCardCVC = TempStars.Validators.validateCreditCardCVC;
validate.validators.postalCodeIsOntario = TempStars.Validators.validatePostalCodeIsOntario;
