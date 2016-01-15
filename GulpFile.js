var gulp = require('gulp');
// var karma = require('karma');

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
    
    var tsResult = gulp.src([
        'src/**/*.ts',
        'typings/tsd.d.ts'])
                       .pipe($.sourcemaps.init()) // This means sourcemaps will be generated
                       .pipe($.typescript({
                           declaration: true,
                        //    sortOutput: true,
                           // ...
                       }));

    return $.merge2([
        tsResult.dts.pipe(gulp.dest('build/ts')),
        tsResult.js
        .pipe($.concat('terminal-quiz.js'))
        .pipe(gulp.dest('build/js'))
    ]);   
});

gulp.task('build-tests', ['build-script'], function () {
    return gulp.src([
        'tests/**/*.ts', 'typings/**/*.d.ts', 'build/**/*.d.ts'])
        .pipe($.typescript({
            out: 'terminal-quiz-tests.js'
        }))
        .pipe(gulp.dest('build/tests'));
});

gulp.task('build-css', function () {

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

gulp.task('build', ['build-clean'], function () {

    gulp.start('build-css', 'build-script', 'build-tests');
});

gulp.task('dist', ['build', 'build-css', 'build-script', 'dist-clean'], function () {

    gulp.start('dist-css', 'dist-script', 'dist-ts');
});

gulp.task('tests', function (done) {

    gulp.src('/foo').pipe($.karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      console.log(err);
      this.emit('end'); //instead of erroring the stream, end it
    });
});