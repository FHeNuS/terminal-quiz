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

  var ts = $.typescript;
  var concat = $.concat;
  var sourcemaps = $.sourcemaps;
  var merge = require('merge2');

  var tsProject = ts.createProject('tsconfig.json');

  var tsResult = gulp.src([
    'src/ts/lib/Autocomplete.ts',
    'src/ts/lib/IQuizOptions.ts',
    'src/ts/lib/QuizSounds.ts',
    'src/ts/lib/QuizAudioManager.ts',
    'src/ts/lib/Quiz.ts',
    'src/ts/lib/Question.ts',
    'src/ts/lib/QuestionProcessor.ts',
    'src/ts/lib/Answer.ts',
    'src/ts/lib/TextQuestion.ts',
    'src/ts/lib/ChoiceQuestion.ts',
    'typings/tsd.d.ts'])
                         .pipe(sourcemaps.init()) // This means sourcemaps will be generated
                         .pipe($.typescript(tsProject, {
                             sortOutput: true,
                         }));

    return merge([
        tsResult.dts
          .pipe(concat('terminal-quiz.d.ts'))
          .pipe(gulp.dest('build/ts')),
        tsResult.js
          .pipe(concat('terminal-quiz.js')) // You can use other plugins that also support gulp-sourcemaps
          .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
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

gulp.task('dist', ['dist-clean'], function () {

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
