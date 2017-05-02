
module.exports = function( Invite ){
    Invite.disableRemoteMethod('createChangeStream', true);
};
