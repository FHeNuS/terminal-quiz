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

var scriptFiles = ['src/ts/references.ts', 'typings/tsd.d.ts'];

var testFiles = ['tests/**/*.ts', 'typings/**/*.d.ts', 'build/**/*.d.ts'];

gulp.task('build-script', function () {

    var tsResult = gulp.src(scriptFiles)
                       .pipe($.sourcemaps.init()) // This means sourcemaps will be generated
                       .pipe($.typescript({
                           declaration: true,
                           out: 'terminal-quiz.js'
                        //    sortOutput: true,
                           // ...
                       }));

    return $.merge2([
        tsResult.dts
        // .pipe($.concat('terminal-quiz.d.ts'))
        .pipe(gulp.dest('build/ts')),
        tsResult.js
        // .pipe($.concat('terminal-quiz.js'))
        .pipe(gulp.dest('build/js'))
    ]);
});

gulp.task('build-tests', ['build-script'], function () {
    return gulp.src(testFiles)
        .pipe($.typescript({
            out: 'terminal-quiz-tests.js'
        }))
        .pipe(gulp.dest('build/tests'));
});

// gulp.task('watch', ['build-script', 'build-tests'], function() {
//     gulp.watch(scriptFiles, ['build-script']);
//     gulp.watch(testFiles, ['build-tests']);
// });

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

gulp.task('buildAndWatch', ['build'], function () {

    gulp.start('watch');
});

gulp.task('dist', ['build', 'build-css', 'build-script', 'dist-clean'], function () {

    gulp.start('dist-css', 'dist-script', 'dist-ts');
});

gulp.task('tests', function (done) {

  new $.karma.Server({
  configFile: __dirname + '/karma.conf.js',
  singleRun: false
}, done).start();
    /*
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      console.log(err);
      this.emit('end'); //instead of erroring the stream, end it
    });*/
});

gulp.task("wiredeps", ['vendor-scripts', 'vendor-css'], function () {

    return gulp.src([
    './src/ts/tests/index.html',
    './karma.conf.js'
  ]).pipe($.wiredep.stream({
           fileTypes: {
               html: {
                   replace: {
                       js: function (filePath) {
                           //return '<script src="' + '@Url.Content("~/Scripts/Vendor/' + filePath.split('/').pop() + '")"></script>';
                           return '<script src="vendor/js/' + filePath.split('/').pop() + '"></script>';
                       },
                       css: function (filePath) {
                           //return '<link rel="stylesheet" href="' + '@Url.Content("~/Content/Vendor/' + filePath.split('/').pop() + '")"/>';
                           return '<link rel="stylesheet" href="~/Content/Vendor/' + filePath.split('/').pop() + '"/>';
                       }
                   }
               },
               js: {
                 block: /(([ \t]*)\/\/\s*bower:*(\S*)\s*)(\n|\r|.)*?(\/\/\s*endbower\s*)/gi,
                 detect: {
                   js: /<script.*src=['"](.+)['"]>/gi,
               },
               replace: {
                 js: function (filePath) {
                     //return '<script src="' + '@Url.Content("~/Scripts/Vendor/' + filePath.split('/').pop() + '")"></script>';
                     return ', "vendor/js/' + filePath.split('/').pop() + '"';
                 }
               },
           },
       }
     })).pipe(gulp.dest('./'));

});

gulp.task('vendor-scripts', null, function () {

    return gulp.src($.wiredep().js)

      .pipe(gulp.dest('vendor/js'));

});

gulp.task('vendor-css', null, function () {

    return gulp.src($.wiredep().css)

      .pipe(gulp.dest('vendor/css'));

});
