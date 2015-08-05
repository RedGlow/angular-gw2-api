module.exports = function(config) {
	config.set({
		frameworks: ['jasmine'],
		preprocessors: {
			'src/*.js': 'coverage'
		},
		files: [
			'node_modules/angular/angular.min.js',
			'node_modules/angular-mocks/angular-mocks.js',
			'src/*.js',
			'tests/*-helper.js',
			'tests/*-spec.js',
		],
		reporters: ['progress', 'coverage'],
		coverageReporter: {
			reporters: [
				{ type: 'text' },
				{ type: 'html', dir: 'coverage' }
			]
		},
		browsers: ['PhantomJS'],
		singleRun: true
	});
};
