
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

    // works for android emulator $$.getJSON('http://10.0.2.2:3000/api/Dentists', function( serverData )
    // works for everythig locally $$.getJSON('http://10.0.1.45:3000/api/Dentists', function( serverData )
    //$$.getJSON('https://riff:raff@api.tempstars.net/api/Dentists', function( serverData )
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
