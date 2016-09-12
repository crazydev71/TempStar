TempStars.Pages.DentistSignup1 = (function() {
    var userAccount;

    function init() {

        app.onPageInit( 'dentist-signup1', function( page ) {
            mainView.showNavbar();

            $$('#dentist-signup1-done-button').on( 'click', doneButtonHandler );
            $$('#dentist-signup1-upload-photo-button').on( 'click', addPhotoHandler );
            $$('#dentist-signup1-remove-photo-button').on( 'click', removePhotoHandler );
            $$('#dentist-signup1-logout-link').on( 'click', logoutHandler );
            $$('#dentist-signup1-form input[name="postalCode"]').on( 'focusout', upcasePostalCode );
            $$('#dentist-signup1-form input').on( 'keypress', keyHandler );

            userAccount = TempStars.User.getCurrentUser();
            $$( '#dentist-signup-email').html( userAccount.email );
        });

        app.onPageBeforeRemove( 'dentist-signup1', function( page ) {
            $$('#dentist-signup1-done-button').off( 'click', doneButtonHandler );
            $$('#dentist-signup1-upload-photo-button').off( 'click', addPhotoHandler );
            $$('#dentist-signup1-remove-photo-button').off( 'click', removePhotoHandler );
            $$('#dentist-signup1-logout-link').off( 'click', logoutHandler );
            $$('#dentist-signup1-form input[name="postalCode"]').off( 'focusout', upcasePostalCode );
            $$('#dentist-signup1-form input').off( 'keypress', keyHandler );
        });

        app.onPageBeforeAnimation( 'dentist-signup1', function( page ) {
            mainView.showNavbar();
        });

        app.onPageAfterAnimation( 'dentist-signup1', function( page ) {
            displayNotification();
        });
    }

    function displayNotification() {
        var min = 0;
        var max = 150;
        var num = Math.floor(Math.random() * (max - min)) + min;

        if ( num < 50 ) {
            return;
        }

        setTimeout( function() {

            var el = app.addNotification({
                title: 'TempStars',
                message: num + ' hygienists are ready to work right now!'
            });

            setTimeout( function() {
                app.closeNotification( el );
            }, 5000);

        }, 3000 );
    }

    function doneButtonHandler( e ) {

        var constraints = {
            practiceName: {
                presence: true
            },
            businessOwner: {
                presence: true
            },
            address: {
                presence: true
            },
            city: {
                presence: true
            },
            postalCode: {
                presence: true,
                postalCode: true,
                postalCodeIsOntario: true
            },
            phone: {
                presence: true,
                phoneNumber: true
            }
        };

        // Clear errors
        $$('#dentist-signup1-form .form-error-msg').html('');
        $$('#dentist-signup1-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#dentist-signup1-form');
        var errors = validate( formData, constraints );

        // Check province
        if ( $$('#dentist-signup1-form select[name=province]').val() == "" ) {
            $('#dentist-signup1-form select[name="province"]').next().addClass('error').html( 'Province must be selected' );
        }

        if ( errors ) {
            if ( errors.practiceName ) {
                $('#dentist-signup1-form input[name="practiceName"]').addClass('error').next().html( errors.practiceName[0] );
            }
            if ( errors.businessOwner ) {
                $$('#dentist-signup1-form input[name="businessOwner"]').addClass('error').next().html( errors.businessOwner[0] );
            }
            if ( errors.address ) {
                $$('#dentist-signup1-form input[name="address"]').addClass('error').next().html( errors.address[0] );
            }
            if ( errors.city ) {
                $$('#dentist-signup1-form input[name="city"]').addClass('error').next().html( errors.city[0] );
            }
            if ( errors.province ) {
                $$('#dentist-signup1-form input[name="province"]').addClass('error').next().html( errors.province[0] );
            }
            if ( errors.postalCode ) {
                $$('#dentist-signup1-form input[name="postalCode"]').addClass('error').next().html( errors.postalCode[0] );
            }
            if ( errors.phone ) {
                $$('#dentist-signup1-form input[name="phone"]').addClass('error').next().html( errors.phone[0] );
            }
            return;
        }

        app.showPreloader('Saving Account');

        uploadPhoto()
        .then( function( photoFileName ) {
            // Save form data
            if ( photoFileName ) {
                formData.photoUrl = TempStars.Config.bucket.baseUrl + photoFileName;
            }

            app.formStoreData('dentist-signup1-form', formData );
            app.hidePreloader();

            // Go to the next page
            mainView.router.loadPage( 'landing/dentist-signup2.html' );
        })
        .catch( function( err ) {
            console.log( err );
            app.hidePreloader();            
            return;
        });
    }

    function addPhotoHandler() {
        navigator.camera.getPicture (
          function(result) {
              $$('#dentist-signup1-photo').attr('src', result );
              $$('#dentist-signup1-photo-remove').show();
              $$('#dentist-signup1-photo-add').hide();
          },
          function(errmsg) {
              app.alert( errmsg )
          },
          {
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              quality: 80,
              targetWidth: 200,
              targetHeight: 200
        });
    }

    function removePhotoHandler( e ) {
        $$('#dentist-signup1-photo').attr( 'src', 'img/dental-office.png' );
        $$('#dentist-signup1-photo-remove').hide();
        $$('#dentist-signup1-photo-add').show();
    }

    function uploadPhoto() {
        return new Promise( function( resolve, reject ) {
            var photoURI = $$('#dentist-signup1-photo').attr('src');

            if ( photoURI == 'img/dental-office.png' ) {
                resolve();
                return;
            }
            var options = new FileUploadOptions();
            options.fileName = uuid.v4() + '.jpg';
            var ft = new FileTransfer();
            var uploadURL = TempStars.Config.server.baseUrl + 'containers/tempstars.ca/upload';
            ft.upload( photoURI,
               encodeURI( uploadURL ),
               function( result ) {
                  resolve( options.fileName );
               },
               function( error ) {
                  reject( error );
               },
               options
            );
        });
    }

    function logoutHandler( e ) {
        app.confirm( 'Are you sure you want to log out?', function() {
            TempStars.User.logout()
            .then( function() {
                mainView.router.loadPage( { url: 'index.html', animatePages: false } );
            });
        });
    }

    function upcasePostalCode( e ) {
        var value = $$(this).val().toLocaleUpperCase();
        $$(this).val( value );
    }

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#dentist-signup1-done-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init
    };

})();

TempStars.Pages.DentistSignup1.init();
