
module.exports = function( PostalCode ){
    PostalCode.disableRemoteMethod('createChangeStream', true);
};
