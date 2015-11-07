module.exports = function(grunt) {

  // My config variables.
  var myConfig = {
    devDir: 'dev',
    prodDir: 'public'
  };

  grunt.initConfig({

    // Load my configs.
    myConfig: myConfig,

    // Clear out the directories if it exists
    clean: {
      // Clear out the prod directory.
      prod: {
        src: [
          '<%= myConfig.prodDir %>'
        ]
      }
    }, // end of clean

    // Copy the source files.
    copy: {
      dev: {
        files: [
          // Copy js files
          {
            expand: true,
            src: ['<%= myConfig.devDir %>/js/*.js'],
            dest: '<%= myConfig.prodDir %>/js',
            flatten: true
          },
          // Copy js files
          {
            expand: true,
            src: ['<%= myConfig.devDir %>/js/models/*.js'],
            dest: '<%= myConfig.prodDir %>/js/models',
            flatten: true
          },
          // Copy css files
          {
            expand: true,
            src: ['<%= myConfig.devDir %>/css/*.css'],
            dest: '<%= myConfig.prodDir %>/css',
            flatten: true
          },
          // Copy library files
          // CSS
          {
            expand: true,
            src: ['bower_components/bootstrap/dist/css/bootstrap.css'],
            dest: '<%= myConfig.prodDir %>/css/lib',
            flatten: true
          },
          // CSS (fonts come with bootstrap)
          {
            expand: true,
            src: ['bower_components/bootstrap/dist/fonts/*'],
            dest: '<%= myConfig.prodDir %>/css/fonts',
            flatten: true
          },
          // JS (jquery)
          {
            expand: true,
            src: ['bower_components/jquery/dist/jquery.js'],
            dest: '<%= myConfig.prodDir %>/js/lib/jquery',
            flatten: true
          },
          // JS (knockout)
          {
            expand: true,
            src: ['bower_components/knockout/dist/knockout.js'],
            dest: '<%= myConfig.prodDir %>/js/lib/knockout',
            flatten: true
          }
        ]
      },
    }, // end of copy

    // Tasks for minifying css.
    cssmin: {
      options: {
        keepBreaks: false,
        mergeAdjacent: true
      },
      target1: {
        files: [{
          expand: true,
          cwd: '<%= myConfig.prodDir %>/css',
          src: ['**/*.css', '!**/*.min.css'],
          dest: '<%= myConfig.prodDir %>/css',
          // ext: '.min.css'
        }]
      }
    }, // end of cssmin
    // Tasks for minifying JavaScript.
    uglify: {
      options: {
        mangle: false,
      },
      myJs: {
        files: {
          '<%= myConfig.prodDir %>/js/app.js':
            '<%= myConfig.prodDir %>/js/app.js',

          '<%= myConfig.prodDir %>/js/config.js':
            '<%= myConfig.prodDir %>/js/config.js',

          '<%= myConfig.prodDir %>/js/loadGoogleMapScriptAsync.js':
            '<%= myConfig.prodDir %>/js/loadGoogleMapScriptAsync.js',

          '<%= myConfig.prodDir %>/js/models/errorModel.js':
            '<%= myConfig.prodDir %>/js/models/errorModel.js',

          '<%= myConfig.prodDir %>/js/models/navigationModel.js':
            '<%= myConfig.prodDir %>/js/models/navigationModel.js',

          '<%= myConfig.prodDir %>/js/models/venueModel.js':
            '<%= myConfig.prodDir %>/js/models/venueModel.js',

          '<%= myConfig.prodDir %>/js/models/wikipediaModel.js':
            '<%= myConfig.prodDir %>/js/models/wikipediaModel.js'
        }
      },
      libJs: {
        files: {
          '<%= myConfig.prodDir %>/js/lib/jquery/jquery.js':
            '<%= myConfig.prodDir %>/js/lib/jquery/jquery.js',

          '<%= myConfig.prodDir %>/js/lib/knockout/knockout.js':
            '<%= myConfig.prodDir %>/js/lib/knockout/knockout.js'
        }
      }
    },
    // Watch files for being updated (used when developing)
    watch: {
      sass: {
        files: [
          '<%= myConfig.devDir %>/**/*.scss'
        ],
        // Run the tasks below on change
        tasks: ['sass'],
        options: {
          spawn: true
        }
      },
      scripts: {
        // TODO: set Base dir. 
        //cwd: '<%= myConfig.devDir %>',
        // files being watched
        files: [
          '<%= myConfig.devDir %>/**/*.js',
          '<%= myConfig.devDir %>/**/*.css'
        ],
        // Run the tasks below on change
        tasks: ['dev'],
        options: {
          spawn: true
        }
      }
    },
    // SASS task
    sass: {
      dist: {
        options: {
          style: 'expanded', // available options: nested, compact, compressed, expanded
          bundleExec: true
        },
        files: [{
          expand: true,
          flatten: true,
          cwd: '<%= myConfig.devDir %>',
          src:['sass/**/*.scss'],
          dest: '<%= myConfig.devDir %>/css',
          ext: '.css'
        }]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // Default task.
  grunt.registerTask('default', ['dev']);

  // Project configuration.
  grunt.registerTask('dev', [
    'clean:prod',
    'copy:dev'
  ]);

  grunt.registerTask('prod', [
    'clean:prod',
    'copy:dev',
    'cssmin:target1',
    'uglify'
  ]);
};
