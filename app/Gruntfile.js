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
                    { expand: true, src: '**', dest: 'www/lib/', cwd: 'src/lib/' },
                    { expand: true, src: '**', dest: 'www/img/', cwd: 'src/img/' },
                    { expand: true, src: 'android.css', dest: 'www/css/', cwd: 'src/app/' }
                ]
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            app: {
                src: ['src/app/*.js','src/pages/*.js','src/pages/landing/*.js'],
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

        includereplace: {
            dist: {
                options: {
                    includesDir: 'src/includes'
                },
                files: [
                  { src: '**/*.html', dest: 'www/', cwd: 'src/pages', expand: true }
                ]
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

    grunt.registerTask( 'default',  ['clean', 'copy', 'concat', 'includereplace' ]);
    grunt.registerTask( 'serve',    ['connect', 'watch']);
    grunt.registerTask( 'ios',      ['clean', 'copy', 'includereplace', 'exec:run_ios']);
    grunt.registerTask( 'android',  ['clean', 'copy', 'includereplace', 'exec:run_android']);
    grunt.registerTask( 'browser',  ['clean', 'copy', 'includereplace', 'exec:run_browser']);

};
