module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'jasmine'],


        // list of files / patterns to load in the browser
        files: [
            "vendor/js/jquery.js"
            , "bower_components/jquery.terminal/js/jquery.terminal-src.js"
            , "vendor/js/jquery.mousewheel-min.js"
            , './build/js/lib/QuizAudioManager.js'
            , './build/js/lib/QuizSounds.js'
            , './build/js/lib/Quiz.js'
            , './build/js/lib/Question.js'
            , './build/js/lib/Answer.js'
            , './build/js/lib/QuestionProcessor.js'
            , './build/js/lib/TextQuestion.js'
            , './build/js/tests/Utils.js'
            , './build/js/tests/Quiz.tests.js'
            , './build/js/tests/Question.tests.js'
            , {
              pattern: './src/ts/tests/fixtures/*.html',
              included: false,
              served: true
            }
        ],
        preprocessors: {
              //'**/*.ts': ['typescript', 'sourcemap'],
              '**/*.js': ['sourcemap']
            },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            // 'PhantomJS'
            , 'Chrome'
            // , 'Firefox'
            // , 'Safari'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

    });
};
