module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [
        'Gruntfile.js',
        'hoodie.template.js',
        'worker.js',
        'hooks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    simplemocha: {
      options: {
        ui: 'tdd'
      },
      unit: {
        src: ['test/unit/*.js']
      },
      integration: {
        src: ['test/integration/*.js']
      }
    },

    mocha_browser: {
      all: {options: {urls: ['http://localhost:<%= connect.options.port %>']}}
    },

    shell: {
      removeData: {
        command: 'rm -rf ' + require('path').resolve(__dirname, 'data')
      },
      npmLink: {
        command: 'npm link && npm link hoodie-plugin-email-debug'
      },
      npmUnlink: {
        command: 'npm unlink && npm unlink hoodie-plugin-email-debug'
      },
      installPlugin: {
        command: 'hoodie install email-debug'
      },
      removePlugin: {
        command: 'hoodie uninstall email-debug'
      }
    },

    hoodie: {
      start: {
        options: {
          www: 'test/browser',
          callback: function (config) {
            grunt.config.set('connect.options.port', config.stack.www.port);
          }
        }
      }
    },

    env: {
      test: {
        HOODIE_SETUP_PASSWORD: 'testing'
      },
      post_launch: {
        INTEGRATION_PORT: '<%= connect.options.port %>'
      }
    },

    watch: {
      jshint: {
        files: ['<%= jshint.files %>'],
        tasks: 'jshint'
      },
      unittest: {
        files: 'worker.js',
        tasks: 'test:unit'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-browser');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-continue');
  grunt.loadNpmTasks('grunt-hoodie');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-env');

  grunt.registerTask('test:unit', ['simplemocha:unit']);
  grunt.registerTask('test:browser', [
    'env:test',
    'shell:removeData',
    'shell:npmLink',
    'shell:installPlugin',
    'hoodie',
    'continueOn',
    'mocha_browser:all',
    'continueOff',
    'hoodie_stop',
    'shell:npmUnlink',
    'shell:removePlugin'
  ]);

  grunt.registerTask('test:integration', ['simplemocha:integration']);
  grunt.registerTask('test:server', [
    'env:test',
    'shell:removeData',
    'shell:npmLink',
    'shell:installPlugin',
    'hoodie',
    'continueOn',
    'env:post_launch',
    'test:integration',
    'continueOff',
    'hoodie_stop',
    'shell:npmUnlink',
    'shell:removePlugin'
  ]);

  grunt.registerTask('test:live', [
    'env:test',
    'shell:removeData',
    'shell:npmLink',
    'shell:installPlugin',
    'hoodie',
    'continueOn',
    'env:post_launch',
  ]);


  grunt.registerTask('default', []);
  grunt.registerTask('test', [
    'jshint',
    'test:unit',
    'test:browser',
    'test:server'
  ]);

};
