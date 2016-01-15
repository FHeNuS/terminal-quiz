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

gulp.task('build-script', function () {
	var tsResult =  gulp.src([
        'src/**/*.ts', 'typings/**/*.d.ts'])
		.pipe($.typescript({
            declaration: true,
            out: 'terminal-quiz.js'
		}));
        
        return $.merge2([
		tsResult.dts.pipe(gulp.dest('build/ts')),
		tsResult.js.pipe(gulp.dest('build/js'))
	]);
});

gulp.task('build-css', function() {

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
    
    return gulp.src('build/js/terminal-quiz.js')
    .pipe($.uglify())
    .pipe(gulp.dest('dist/js'))  
});

gulp.task('dist-ts', function () {
    
    return gulp.src('build/ts/**/terminal-quiz.d.ts')
    .pipe(gulp.dest('dist/ts'))  
});

gulp.task('build', ['build-clean'], function() {
  
  gulp.start('build-css', 'build-script');
});

gulp.task('dist', ['build', 'build-css', 'build-script', 'dist-clean'], function() {
    
    gulp.start('dist-css', 'dist-script', 'dist-ts');
});