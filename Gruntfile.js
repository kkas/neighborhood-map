module.exports = function(grunt) {

  // My config variables.
  var myConfig = {
    devDir: 'dev',
    prodDir: 'prod',
  };

  grunt.initConfig({

    // Load my configs.
    myConfig: myConfig,

    // Clear out the directories if it exists
    clean: {
      // Clear out the directories for images in the dev dir.
      devImg: {
        src: [
          '<%= myConfig.devImgSrc1 %>',
          '<%= myConfig.devImgSrc2 %>'
        ]
      },
      // Clear out the prod directory.
      prod: {
        src: ['<%= myConfig.prodDir %>']
      }
    }, // end of clean

    // Generate the directories for images if it is missing
    mkdir: {
      // Make directories for images in the dev dir.
      devImg: {
        options: {
          create: [
            '<%= myConfig.devImgSrc1 %>',
            '<%= myConfig.devImgSrc2 %>'
          ]
        }
      }
    }, // end of mkdir

    // Copy the images
    copy: {
      // Copy original images into the directory for development.
      devImg: {
        files: [
          {
            expand: true,
            src: ['<%= myConfig.devOrigImgSrc1 %>/*.{gif,jpg,png}'],
            dest: '<%= myConfig.devImgSrc1 %>/',
            flatten: true
          },
          {
            expand: true,
            src: ['<%= myConfig.devOrigImgSrc2 %>/*.{gif,jpg,png}'],
            dest: '<%= myConfig.devImgSrc2 %>/',
            flatten: true
          }
        ]
      },
      prod: {
        files: [
          // Settings for copying all the files, except for 'index.html', 'js/*',
          // and 'css/style.css'.
          {
            expand: true,
            // makes all src relative to cwd
            cwd: '<%= myConfig.devDir %>/',
            // exclude 'css/style.css' since this file will be inlined by grunt-critical.
            // exclude 'js/*' and 'js/perfmatters.min.js' since I will copy this
            // file with the dedicated setting.
            src: [
              '**',
              '!**/orig_images/**',
              '!css/style.css',
              '!js/*',
              '!index.html',
              '!index-critical.html'
            ],
            dest: '<%= myConfig.prodDir %>/',
            // Rename the files with extention '.min.css' to '.css' while coping
            // to the production directory, so that I don't have to change the links
            // in the html files.
            //
            // I knew about this option from the following link:
            // http://stackoverflow.com/questions/15271121/how-can-i-rename-files-with-grunt-based-on-the-respective-files-parent-folder
            rename: function(dest, src) {
              var newName = src.replace(/\.min\.css/, ".css");
              // console.log('src, newName:', src, newName);
              return dest + newName;
            }
          },
          // Settings for copying only 'js/perfmatters.min.js'.
          // Copy this file with renaming to 'js/perfmatters.js' into the prod directory.
          {
            expand: true,
            src: [
              '<%= myConfig.devDir %>/js/perfmatters.min.js',
              '<%= myConfig.devDir %>/js/analytics.min.js',
            ],
            dest: '<%= myConfig.prodDir %>/js/',
            rename: function(dest, src) {
              var retName;

              if (src.search(/analytics/) != -1) {
                retName = "analytics.js";
              } else {
                retName = "perfmatters.js";
              }

              return dest + retName;
            }
          },
          // Settings for copying only index.html. Since grunt-critical generates the
          // production code, 'index-critical.html', I rename the file to 'index.html' and copy it
          // into the prod directory.
          {
            expand: true,
            src: ['<%= myConfig.devDir %>/index-critical.html'],
            dest: '<%= myConfig.prodDir %>/',
            rename: function(dest, src) {
              return dest + 'index.html';
            }
          }
        ]
      }
    }, // end of copy

    // Task for inlining CSS.
    critical: {
      dev: {
        options: {
          base: 'dev/',
          css: ['<%= myConfig.devDir %>/css/style.css'],
          minify: true
          // width: ??,
          // height: ??,
        },
        src: '<%= myConfig.devDir %>/index.html',
        dest: '<%= myConfig.devDir %>/index-critical.html'
      }
    }, // end of critical

    // Task for PSI(PageSpeed Insights)
    pagespeed: {
      options: {
        nokey: true
      },
      prod_desktop: {
        options: {
          url: "http://kkas.github.io/frontend-nanodegree-mobile-portfolio/",
          locale: "en_GB",
          strategy: "desktop",
          threshold: 90
        }
      },
      prod_mobile: {
        options: {
          url: "http://kkas.github.io/frontend-nanodegree-mobile-portfolio/",
          locale: "en_GB",
          strategy: "mobile",
          threshold: 90
        }
      }
    }, // end of PSI
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-pagespeed');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-critical');

  // Default task.
  grunt.registerTask('default', ['speedtest']);

  // Project configuration.

};
