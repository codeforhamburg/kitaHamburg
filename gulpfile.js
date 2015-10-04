"use strict";

var gulp = require('gulp'),
		browserSync = require('browser-sync');


gulp.task('dev', [], function(cb){
	
});

gulp.task('serve', ['dev'], function(){
	browserSync.init({
		host: 'localhost',
		port: 9988,
		proxy: 'localhost:8877',	
		browser: ['firefox'],
		online: false,
		open: true,
		startPath: '/',
		scrollProportionally: false,
		scrollThrottle: 5,
		injectChanges: true,
		timestamps: true,
		loglevel: 'info',
	  logConnections: true,
		logFileChanges: true,		
	});
});

gulp.task('default', ['dev']);
