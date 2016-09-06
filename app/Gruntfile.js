module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */\n',


        // Task configuration
        clean: {
            build: ['www/*']
        },

        copy: {
            build: {
                files: [
                    { cwd: 'src/lib/', src: '**', dest: 'www/lib/', expand: true },
                    { cwd: 'src/img/', src: '**', dest: 'www/img/', expand: true },
                    { cwd: 'src/app/', src: 'android.css', dest: 'www/css/', expand: true }
                ]
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            app: {
                src: ['src/app/bootstrap.js', 'src/app/config.js', 'src/app/!(bootstrap|config)*.js','src/pages/*.js','src/pages/landing/*.js'],
                dest: 'www/js/tempstars.app.js'
            },
            dentist: {
                src: ['src/pages/dentist/*.js'],
                dest: 'www/js/tempstars.dentist.js'
            },
            hygienist: {
                src: ['src/pages/hygienist/*.js'],
                dest: 'www/js/tempstars.hygienist.js'
            },
            app_css: {
                src: ['src/app/!(android)*.css','src/pages/*.css','src/pages/landing/*.css'],
                dest: 'www/css/tempstars.app.css'
            },
            dentist_css: {
                src: ['src/pages/dentist/*.css'],
                dest: 'www/css/tempstars.dentist.css'
            },
            hygienist_css: {
                src: ['src/pages/hygienist/*.css'],
                dest: 'www/css/tempstars.hygienist.css'
            }
        },

        template: {
            android: {
                options: {
                    data: {
                        cssfile: 'android/index.css.html'
                    }
                },
                files: {
                    'www/index.html': ['src/pages/index.html.tpl']
                }
            },
            ios: {
                options: {
                    data: {
                        cssfile: 'ios/index.css.html'
                    }
                },
                files: {
                    'www/index.html': ['src/pages/index.html.tpl']
                }
            },
            browser: {
                options: {
                    data: {
                        cssfile: 'browser/index.css.html'
                    }
                },
                files: {
                    'www/index.html': ['src/pages/index.html.tpl']
                }
            }
        },

        includereplace: {

            all: {
                options: {
                    includesDir: 'src/includes'
                },
                files: [
                    { cwd: 'www/', src: 'index.html', dest: 'www/', expand: true },
                    { cwd: 'src/pages', src: '**/!(index)*.html', dest: 'www/', expand: true }
                ]
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: true
            },
            app: {
                src: 'dist/tempstars.app.js',
                dest: 'dist/tempstars.app.min.js'
            },
            dentist: {
                src: 'dist/tempstars.dentist.js',
                dest: 'dist/tempstars.dentist.min.js'
            },
            hygienist: {
                src: 'dist/tempstars.hygienist.js',
                dest: 'dist/tempstars.hygienist.min.js'
            }
        },

        jshint: {
            options: {
                boss: true,
                browser: true,
                curly: true,
                debug: true,
                eqeqeq: true,
                eqnull: true,
                esversion: 5,
                expr: true,
                freeze: true,
                latedef: true,
                loopfunc: true,
                noarg: true,
                nonew: true,
                node: true,
                strict: true,
                undef: true,
                unused: 'vars',
                validthis: true,
                globals: { $: true, Dom7: true, Template7: true, $$: true },
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            app: {
                src: ['src/app/*.js', 'src/landing/*.js']
            },
            dentist: {
                src: ['src/pages/dentist/*.js']
            },
            hygienist: {
                src: ['src/pages/hygienist/*.js']
            }
        },

        watch: {
            src: {
                files: ['src/**'],
                tasks: ['default']
            },
            livereload: {
                files: ['www/**'],
                options: {
                    livereload: true,
                    spawn: true
                }
                // tasks: ['exec:prepare']
            }
        },

        exec: {
            run_ios: 'cordova run ios',
            run_android: 'cordova run android',
            run_browser: 'cordova run browser',
            prepare: {
                command:"cordova prepare",
                stdout:true,
                stderror:true
            }
        },

        connect: {
          server: {
            options: {
              port: 5000,
              base: 'www',
              hostname: '0.0.0.0',
              protocol: 'http',
              livereload: true,
              open: true
            }
          }
        }

    });

    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-template');

    grunt.registerTask( 'default',  ['clean', 'copy', 'concat',  'template:browser', 'includereplace' ]);
    grunt.registerTask( 'serve',    ['connect', 'watch']);
    grunt.registerTask( 'ios',      ['clean', 'copy', 'concat', 'template:ios',     'includereplace', 'exec:run_ios']);
    grunt.registerTask( 'android',  ['clean', 'copy', 'concat', 'template:android', 'includereplace', 'exec:run_android']);
    grunt.registerTask( 'browser',  ['clean', 'copy', 'concat', 'template:browser', 'includereplace', 'exec:run_browser']);

};
