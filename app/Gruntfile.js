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
                    { expand: true, src: '**', dest: 'www/app/', cwd: 'src/app/' },
                    { expand: true, src: '**', dest: 'www/img/', cwd: 'src/img/' }
                ]
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['lib/*.js'],
                dest: 'dist/tempstars.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/tempstars.min.js'
            }
        },

        jshint: {
            options: {
                node: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                eqnull: true,
                browser: true,
                globals: { jQuery: true },
                boss: true
            },
            gruntfile: {
                src: 'gruntfile.js'
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
                  { src: '**/*', dest: 'www/', cwd: 'src/templates', expand: true }
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask( 'default',  ['clean', 'copy', 'includereplace' ]);
    grunt.registerTask( 'serve',    ['connect', 'watch']);
    grunt.registerTask( 'ios',      ['clean', 'copy', 'includereplace', 'exec:run_ios']);
    grunt.registerTask( 'android',  ['clean', 'copy', 'includereplace', 'exec:run_android']);
    grunt.registerTask( 'browser',  ['clean', 'copy', 'includereplace', 'exec:run_browser']);

};
