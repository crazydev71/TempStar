
var loopback   = require('loopback');
var boot       = require('loopback-boot');
var exphbs     = require('express-handlebars');
var bodyParser = require('body-parser');

var app = module.exports = loopback();

app.engine( 'handlebars', exphbs({defaultLayout: 'main'}));
app.set( 'view engine', 'handlebars');
app.use( bodyParser.urlencoded({extended: true}));

app.use('/v2/minVersion', function( req, res, next ) {
    res.json({ version: app.get('minVersion') });
});

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log( 'Starting in the ' + process.env.NODE_ENV + ' environment' );
    console.log('TempStars API service listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse the TempStars API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
