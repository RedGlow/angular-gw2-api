module.exports = function(config) {
	config.set({
		frameworks: ['jasmine'],
		files: [
			'node_modules/angular/angular.js',
			'node_modules/angular-mocks/angular-mocks.js',
			'src/*.js',
			'tests/*-helper.js',
			'tests/*-spec.js',
		],
		reporters: ['progress'],
		browsers: ['Chrome'],
		singleRun: false
	});
};
