
module.exports = function( Region ){
    Region.disableRemoteMethod('createChangeStream', true);
};
