
var loopback   = require('loopback');
var boot       = require('loopback-boot');
var exphbs     = require('express-handlebars');
var bodyParser = require('body-parser');
var moment     = require( 'moment' );

var app = module.exports = loopback();

app.engine( 'handlebars', exphbs({defaultLayout: 'main'}));
app.set( 'view engine', 'handlebars');
app.use( bodyParser.urlencoded({extended: true}));

app.use('/v2/minVersion', function( req, res, next ) {
    res.json({ version: app.get('minVersion') });
});

var push     = require( 'push' );
var notifier = require( 'notifier' );

var expirePeriod = 18;  // hrs

// push.init(
//     app.get('gcmApiKey'),
//     {
//         key: app.get('apnKey'),
//         keyId: app.get('apnKeyId'),
//         teamId: app.get('apnTeamId')
//     },
//     app.get('pushEnv')
// );

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');

    checkExpirePartialOffers();
    checkExpireJobs();
    setInterval(function() {
      checkExpirePartialOffers();
      checkExpireJobs();
    }, 60000);

    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log( 'Starting in the ' + process.env.NODE_ENV + ' environment' );
    console.log('TempStars API service listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse the TempStars API at %s%s', baseUrl, explorerPath);
    }
  });
};

function checkExpirePartialOffers() {
  var PartialOffer = app.models.PartialOffer;
  var Hygienist = app.models.Hygienist;

  console.log('check expire partial offer');
  PartialOffer.find().then( function( offers ) {
    var curTime = moment.utc();
    for (var i = 0; i < offers.length; i++) {
      var createdTime = offers[i].createdOn;
      var duration = moment.utc(createdTime).add(expirePeriod, 'hour').valueOf() - curTime.valueOf();

      if (offers[i].status === 0 && duration <= 0) {
        console.log('expired offer: ' + offers[i].id);
        expirePartialOffer(createdTime, offers[i].hygienistId, offers[i].jobId, offers[i].id);
      }
    }
  })
  .catch( function( err ) {
    console.log( 'expire custom offer error!' );
  });
}

function expirePartialOffer(createdTime, hygienistId, jobId, offerId) {
  var Hygienist = app.models.Hygienist;
  var Email = app.models.Email;
  var messge = "";
  var hygienist;

  Hygienist.cancelPartialOffer(hygienistId, jobId, offerId, function() {
    Hygienist.findById( hygienistId )
    .then( function( h ) {
      hygienist = h.toJSON();
      console.log(hygienist.user.platform + ' : ' + hygienist.user.registrationId);

      messge = "Your Custom Offer for " + moment(createdTime).format('ddd MMM D, YYYY') + " has expired.";
      console.log(messge);
      return push.send( messge, hygienist.user.platform, hygienist.user.registrationId );
    })
    .then( function( response ) {
      return new Promise( function( resolve, reject ) {
        Email.send({
          from: app.get('emailFrom'),
          to: hygienist.user.email,
          bcc:  app.get('emailBcc'),
          subject: 'Custom Offer for ' + moment(createdTime).format('ddd MMM D, YYYY') + ' expired',
          text: messge
        }, function( err ) {
          if ( err ) {
            console.log( err.message );
          }
        });
      });
    });
  });
}

function checkExpireJobs() {
  console.log('check expire jobs');
  var Job = app.models.Job;
  var Dentist = app.models.Dentist;

  Job.find().then( function( jobs ) {
    var curTime = moment.utc();
    for (var i = 0; i < jobs.length; i++) {
      var job = jobs[i].toJSON();
      if (job.hygienistId === 0 && (job.status === 1 || job.status === 2)) {
        if (job.shifts && job.shifts[0].type === 2) {
          var postedEnd = job.shifts[0].postedEnd;

          if (postedEnd && moment.utc(postedEnd).valueOf() - curTime.valueOf() <= 0) {
            console.log('expired job: ' + job.id);
            Dentist.expireJob(job.id, function() {

            });
          }
        }
      }
    }
  })
  .catch( function( err ) {
    console.log( 'expire job error!' );
  });

}

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
