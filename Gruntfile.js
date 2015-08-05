module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			dist: {
				src: 'src/*.js'
			}
		},
		uglify: {
			options: {
				mangle: false,
				compress: {
					drop_console: true
				}
			},
			dist: {
				files: {
					'build/gw2api.min.js': [
						'src/*.js'
					]
				}
			}
		},
		karma: {
			tests: {
				options: {
					configFile: 'karma.conf.js'
				}
			},
			testsdebug: {
				options: {
					configFile: 'karma.debug.conf.js'
				}
			}
		}
	});

	// Default task(s).
	grunt.registerTask('dist', [
		'jshint',
		'karma:tests',
		'uglify'
	]);

};