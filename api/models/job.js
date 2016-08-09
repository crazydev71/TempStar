
module.exports = function( Job ){
    Job.disableRemoteMethod('createChangeStream', true);
};
