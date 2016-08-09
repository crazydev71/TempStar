
module.exports = function( Invoice ){
    Invoice.disableRemoteMethod('createChangeStream', true);
};
