var gulp = require('gulp');

$ = require('gulp-load-plugins')({
    pattern: ['*']
});

gulp.task('dist-clean', function () {
    return $.del('dist');
});

gulp.task('build-clean', function () {
    return $.del('build');
});

gulp.task('build-ts', function () {
	return gulp.src([
        'src/**/*.ts', 'typings/**/*.d.ts'])
		.pipe($.typescript({
		}))
		.pipe(gulp.dest('build/js'));
});

gulp.task('build-prefixer', function() {

    return gulp.src('src/css/**/*.css')
		.pipe($.autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('build/css'));    
});

gulp.task('dist-css', function () {
    return gulp.src('build/css/**/*.css')
    .pipe($.cssnano())
    .pipe($.concat('terminal-quiz.css'))
    .pipe(gulp.dest('dist/css'))  
});

gulp.task('dist-script', function () {
    return gulp.src('build/js/**/*.js')
    .pipe($.uglify())
    .pipe($.concat('terminal-quiz.js'))
    .pipe(gulp.dest('dist/js'))  
});

gulp.task('build', ['build-clean', 'build-ts', 'build-prefixer']);

gulp.task('dist', ['build'], function() {
    
  $.runSequence('dist-clean', 'dist-css', 'dist-script');
});