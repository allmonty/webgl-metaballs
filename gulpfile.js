'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', function() {
  return console.log('Use [gulp sass:watch] to watch .scss files!');
});

gulp.task('sass', function () {
	gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});