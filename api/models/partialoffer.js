
module.exports = function( PartialOffer ){
    PartialOffer.disableRemoteMethod('createChangeStream', true);
};
