module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            // bower:js



            , "vendor/js/jquery.js"
            , "vendor/js/jquery.terminal-min.js"
            , "vendor/js/jquery.mousewheel-min.js"
            , "vendor/js/jasmine.js"
            , "vendor/js/jasmine.js"
            , "vendor/js/jasmine-jquery.js"
            // endbower
            , './build/js/lib/Quiz.js'
            , './build/js/lib/Question.js'
            , './build/js/lib/TextQuestion.js'
            , 'bower_components/jasmine-jquery/lib/jasmine-jquery.js'
            , './build/js/tests/**.js'
        ],

        /*preprocessors: {
            'tests/*.ts': ['typescript']
        },
        typescriptPreprocessor: {
            // options passed to the typescript compiler
            options: {
                sourceMap: false, // (optional) Generates corresponding .map file.
                target: 'ES5', // (optional) Specify ECMAScript target version: 'ES3' (default), or 'ES5'
                module: 'amd', // (optional) Specify module code generation: 'commonjs' or 'amd'
                noImplicitAny: true, // (optional) Warn on expressions and declarations with an implied 'any' type.
                noResolve: true, // (optional) Skip resolution and preprocessing.
                removeComments: true, // (optional) Do not emit comments to output.
                concatenateOutput: false // (optional) Concatenate and emit output to single file. By default true if module option is omited, otherwise false.
            },
            // extra typing definitions to pass to the compiler (globs allowed)
            typings: [
                'typings/tsd.d.ts',
            ],
            // transforming the filenames
            transformPath: function (path) {
                return path.replace(/\.ts$/, '.js');
            }
        },
        // list of files to exclude
        exclude: [

        ],*/

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
            'PhantomJS'
            // , 'Chrome'
            // , 'Firefox'
            // , 'Safari'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
