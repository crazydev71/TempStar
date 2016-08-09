
// Determine theme depending on device
var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;

// Set Template7 global devices flags
Template7.global = {
    android: isAndroid,
    ios: isIos
};

// Define Dom7
var $$ = Dom7;

// Change Through navbar layout to Fixed
if (isAndroid) {
    // Change class
    $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
    // And move Navbar into Page
    $$('.view .navbar').prependTo('.view .page');
}

// Init App
var myApp = new Framework7({
    // Enable Material theme for Android device only
    material: isAndroid ? true : false,
    // Enable Template7 pages
    template7Pages: true
});

// Init View
var mainView = myApp.addView('.view-main', {
    // Don't worry about that Material doesn't support it
    // F7 will just ignore it for Material theme
    dynamicNavbar: true
});

$$(document).on( 'ajaxStart', function(e) {
    console.log( 'ajax start' );
});
$$(document).on( 'ajaxError', function(e) {
    console.dir( 'err' + JSON.stringify( e ) );
});
$$(document).on( 'ajaxSuccess', function(e) {
    console.log( 'ajax success' );
});
$$(document).on( 'ajaxComplete', function(e) {
    console.log( 'ajax complete' );
});

$$('#but').on( 'click', function(e) {
    // For now just put get dentists here
    console.log( 'click');
    var dentistTemplate = $$('#DentistTemplate').html();
    var compiledDentistTemplate = Template7.compile(dentistTemplate);

    // works for android emulator $$.getJSON('http://10.0.2.2:3000/api/Dentists', function( serverData ) {
    // works for everythig locally $$.getJSON('http://10.0.1.45:3000/api/Dentists', function( serverData ) {
    //$$.getJSON('https://riff:raff@api.tempstars.net/api/Dentists', function( serverData ) {
    $$.ajax({
        cache: false,
        contentType: 'application/json',
        dataType: 'json',
        username: 'riff',
        password: 'raff',
        timeout: 10 * 1000,
        success: updateDentists,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(unescape(encodeURIComponent('riff' + ':' + 'raff'))));
        },
        url: 'https://api.tempstars.net/v2/Dentists'
        //url: 'http://10.0.1.45:3000/api/Dentists'
    });

function updateDentists( serverData ) {
        console.log( 'got data');
        //var dentists = { dentists: [ { practiceName: 'Fred'}, {practiceName:'Barney'} ] };
        var dentistData = {};
        dentistData.dentists = serverData;
        var html = compiledDentistTemplate( dentistData );
        $$('#dentist-list')[0].insertAdjacentHTML( 'afterbegin', html  );
}

});
