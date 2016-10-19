
TempStars.Pages.Dentist.Profile = (function() {

    'use strict';

    var data;
    var initialized = false;

    function init() {

        app.onPageAfterAnimation( 'dentist-profile', function( page ) {
            if ( data.photoUrl ) {
                $$('#dentist-profile-photo').attr('src', data.photoUrl );
                $$('#dentist-profile-photo-remove').show();
                $$('#dentist-profile-photo-add').hide();
            }

            $$('#dentist-profile-upload-photo-button').on( 'click', addPhotoHandler );
            $$('#dentist-profile-remove-photo-button').on( 'click', removePhotoHandler );
            $$('#dentist-profile-web-photo').on( 'change', webPhotoHandler );
        });

        app.onPageBeforeInit( 'dentist-profile', function( page ) {

            if ( ! initialized ) {
                $$(document).on( 'click','#dentist-profile-save-button', submitHandler );
                $$('#dentist-profile-upload-photo-button').on( 'click', addPhotoHandler );
                $$('#dentist-profile-remove-photo-button').on( 'click', removePhotoHandler );
                $$('#dentist-profile-web-photo').on( 'change', webPhotoHandler );
                $$('#dentist-profile-form input[name="postalCode"]').on( 'focusout', upcasePostalCode );
                $$('#dentist-profile-form input').on( 'keypress', keyHandler );
                initialized = true;
            }

            if ( data.photoUrl ) {
                $$('#dentist-profile-photo').attr('src', data.photoUrl );
                $$('#dentist-profile-photo-remove').show();
                $$('#dentist-profile-photo-add').hide();
            }

            $$('#dentist-profile-form select[name="province"]').val(data.province).prop('selected', true);
            $$('#dentist-profile-form select[name="parking"]').val(data.detail.parking).prop('selected', true);
            $$('#dentist-profile-form select[name="payment"]').val(data.detail.payment).prop('selected', true);
            $$('#dentist-profile-form select[name="hygienistArrival"]').val(data.detail.hygienistArrival).prop('selected', true);
            $$('#dentist-profile-form select[name="radiography"]').val(data.detail.radiography).prop('selected', true);
            $$('#dentist-profile-form select[name="ultrasonic"]').val(data.detail.ultrasonic).prop('selected', true);
            $$('#dentist-profile-form select[name="avgApptTime"]').val(data.detail.avgApptTime).prop('selected', true);
            $$('#dentist-profile-form select[name="charting"]').val(data.detail.charting).prop('selected', true);
            $$('#dentist-profile-form select[name="software"]').val(data.detail.software).prop('selected', true);
        });

        app.onPageBeforeRemove( 'dentist-profile', function( page ) {
            // $(document).off( 'click','#dentist-profile-save-button', saveHandler );
            // $$('#dentist-profile-form input[name="postalCode"]').off( 'focusout', upcasePostalCode );
            // $$('#dentist-profile-form input').off( 'keypress', keyHandler );
        });

    }

    function getData() {

        return new Promise( function( resolve, reject ) {
            TempStars.Api.getDentist()
            .then( function( profile ) {
                data = profile;
                resolve( data );
            })
            .catch( function( err ) {
                app.alert('Error retrieving profile. Please try again' );
                reject( err );
            });
        });
    }

    function submitHandler(e) {
        var formData = app.formToJSON('#dentist-profile-form');

        var constraints = {
            // email: {
            //     presence: true,
            //     email: true
            // },
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
            province: {
                presence: {message: "is required"}
            },
            postalCode: {
                presence: true,
                postalCode: true,
                postalCodeIsOntario: true
            },
            phone: {
                presence: true,
                phoneNumber: true
            },
            primaryContact: {
                presence: true
            },
            parking: {
                presence: {message: "is required"}
            },
            payment: {
                presence: {message: "is required"}
            },
            hygienistArrival: {
                presence: {message: "is required"}
            },
            radiography: {
                presence: {message: "is required"}
            },
            ultrasonic: {
                presence: {message: "is required"}
            },
            avgApptTime: {
                presence: {message: "is required"}
            },
            charting: {
                presence: {message: "is required"}
            },
            software: {
                presence: {message: "is required"}
            }
        };

        // Clear errors
        $$('#dentist-profile-form .form-error-msg').html('');
        $$('#dentist-profile-form .field-error-msg').removeClass( 'error' ).html('');

        var errors = validate( formData, constraints );
        if ( errors ) {
            // if ( errors.email ) {
            //     $('#dentist-profile-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            // }
            if ( errors.practiceName ) {
                $$('#dentist-profile-form input[name="practiceName"]').addClass('error').next().html( errors.practiceName[0] );
            }
            if ( errors.businessOwner ) {
                $$('#dentist-profile-form input[name="businessOwner"]').addClass('error').next().html( errors.businessOwner[0] );
            }
            if ( errors.address ) {
                $$('#dentist-profile-form input[name="address"]').addClass('error').next().html( errors.address[0] );
            }
            if ( errors.city ) {
                $$('#dentist-profile-form input[name="city"]').addClass('error').next().html( errors.city[0] );
            }
            if ( errors.province ) {
                $$('#dentist-profile-form select[name="province"]').addClass('error').next().html( errors.province[0] );
            }
            if ( errors.postalCode ) {
                $$('#dentist-profile-form input[name="postalCode"]').addClass('error').next().html( errors.postalCode[0] );
            }
            if ( errors.phone ) {
                $$('#dentist-profile-form input[name="phone"]').addClass('error').next().html( errors.phone[0] );
            }
            if ( errors.primaryContact ) {
                $$('#dentist-profile-form input[name="primaryContact"]').addClass('error').next().html( errors.primaryContact[0] );
            }
            if ( errors.parking ) {
                $$('#dentist-profile-form select[name="parking"]').addClass('error').next().html( errors.parking[0] );
            }
            if ( errors.payment ) {
                $$('#dentist-profile-form select[name="payment"]').addClass('error').next().html( errors.payment[0] );
            }
            if ( errors.hygienistArrival ) {
                $$('#dentist-profile-form select[name="hygienistArrival"]').addClass('error').next().html( errors.hygienistArrival[0] );
            }
            if ( errors.radiography ) {
                $$('#dentist-profile-form select[name="radiography"]').addClass('error').next().html( errors.radiography[0] );
            }
            if ( errors.sterilization ) {
                $$('#dentist-profile-form select[name="sterilization"]').addClass('error').next().html( errors.sterilization[0] );
            }
            if ( errors.ultrasonic ) {
                $$('#dentist-profile-form select[name="ultrasonic"]').addClass('error').next().html( errors.ultrasonic[0] );
            }
            if ( errors.avgApptTime ) {
                $$('#dentist-profile-form select[name="avgApptTime"]').addClass('error').next().html( errors.avgApptTime[0] );
            }
            if ( errors.charting ) {
                $$('#dentist-profile-form select[name="charting"]').addClass('error').next().html( errors.charting[0] );
            }
            if ( errors.software ) {
                $$('#dentist-profile-form select[name="software"]').addClass('error').next().html( errors.software[0] );
            }
            return;
        }

        app.modal({
          title:  'Save Profile',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: function() {
                  saveProfile( formData );
                }}
          ]
        });

        // app.confirm( 'Are you sure?', 'Save Profile', function() {
        //     app.confirm( 'Are you really sure?', 'Save Profile', function() {
        //         app.confirm( 'Are you really really sure?', 'Save Profile', function() {
        //             saveProfile( formData );
        //         });
        //     });
        // });
    }

    function saveProfile( formData ) {

        app.showPreloader('Saving Profile');
        uploadPhoto()
        .then( function( photoFileName ) {
            formData.photoUrl =  photoFileName;
            formData.detailId = data.detail.id;
            return TempStars.Api.updateDentistAccount( data.id, formData );
        })
        .then( function() {
            //app.formStoreData( '#dentist-profile-form', formData );
            return TempStars.User.refresh();
        })
        .then(function() {
            app.hidePreloader();
            TempStars.App.gotoStartingPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error updating profile.  Please try again.' );
            // $$('#dentist-profile-form .form-error-msg')
            //     .html('<span class="ti-alert"></span> Updating Profile failed. ' + err.error.message )
            //     .show();
        });
    }

    function addPhotoHandler(e) {
        e.preventDefault();

        if ( window.cordova ) {
            navigator.camera.getPicture (
              function(result) {
                  $$('#dentist-profile-photo').attr('src', result );
                  $$('#dentist-profile-photo-remove').show();
                  $$('#dentist-profile-photo-add').hide();
              },
              function(errmsg) {
                  app.alert( errmsg );
              },
              {
                  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                  quality: 80,
                  targetWidth: 200,
                  targetHeight: 200
            });
        }
        else {
            $$('#dentist-profile-web-photo').click();
        }

    }

    function removePhotoHandler( e ) {
        $$('#dentist-profile-photo').attr( 'src', '' );
        $$('#dentist-profile-photo-remove').hide();
        $$('#dentist-profile-photo-add').show();
    }

    function webPhotoHandler( e ) {
        var f = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            $$('#dentist-profile-photo-remove').show();
            $$('#dentist-profile-photo-add').hide();
            $$('#dentist-profile-photo').attr( 'src', event.target.result );
        };
        reader.readAsDataURL(f);
    }

    function uploadPhoto() {
        return new Promise( function( resolve, reject ) {
            var photoURI = $$('#dentist-profile-photo').attr('src');

            if ( photoURI == 'img/dental-office.png' ) {
                resolve( '' );
                return;
            }

            // If photo hasn't changed, don't need to upload
            if ( photoURI == data.photoUrl ) {
                resolve( photoURI );
                return;
            }

            // If the photo was removed, don't need to upload
            // TODO remove old photo from server
            if ( photoURI === '' ) {
                resolve( photoURI );
                return;
            }

            if( window.cordova ) {

                // Otherwise new photo so upload
                var options = new FileUploadOptions();
                options.fileName = uuid.v4() + '.jpg';
                var ft = new FileTransfer();
                var uploadURL = TempStars.Config.server.baseUrl + 'containers/tempstars.ca/upload';
                ft.upload( photoURI,
                   encodeURI( uploadURL ),
                   function( result ) {
                      resolve( TempStars.Config.bucket.baseUrl + options.fileName );
                   },
                   function( error ) {
                      reject( error );
                   },
                   options
                );
            }
            else {
                // Browser
                var ext, f;

                f = $('#dentist-profile-web-photo')[0].files[0];
                switch (f.type) {
                    case 'image/jpeg':
                    case 'image/jpg':
                        ext = '.jpg';
                        break;

                    case 'image/gif':
                        ext = '.gif';
                        break;

                    case 'image/png':
                        ext = '.png';
                        break;

                    default:
                        reject( new Error( 'unknown image type'));
                        return;
                }

                var dataURI = $('#dentist-profile-photo').attr( "src" );
                var blob = TempStars.File.convertDataURItoBlobSync( dataURI );

                // Rename file
                var fileName = uuid.v4() + ext;

                var uploadURL = 'containers/tempstars.ca/upload';
                var formData = new FormData();
                formData.append( 'photo', blob, fileName );
                TempStars.Ajax.upload( uploadURL, formData )
                .then( function( result ) {
                    resolve( TempStars.Config.bucket.baseUrl + fileName );
                })
                .catch( function( err ) {
                    reject( err );
                });
            }
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
            $$('#dentist-profile-save-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init,
        getData: getData
    };

})();

TempStars.Pages.Dentist.Profile.init();
