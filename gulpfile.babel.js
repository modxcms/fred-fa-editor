'use strict';

// This gulpfile makes use of new JavaScript features.
// Babel handles this without us having to do anything. It just works.
// You can read more about the new JavaScript features here:
// https://babeljs.io/docs/learn-es2015/

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import webpack from 'webpack';
import del from 'del';
import pkg from './package.json';
import webpackConfig from "./webpack.config.js";
import merge from "merge-stream";
import concat from "gulp-concat";
import request from "request";
import util from "gulp-util";
import source from "vinyl-source-stream";
import yaml from "gulp-yaml";

const $ = gulpLoadPlugins();
const libFolder = './_build/assets/lib';
const tmpFolder = './_build/assets/tmp/';
const prodFolder = './_build/assets/js/';
const tmpIcons = 'icons.temp.yml';
const sources = './_build/assets/js/**/*.js';

function onBuild(done, taskName) {
    return (err, stats) => {
        if (err)
            throw new gutil.PluginError(taskName, err);
        $.util.log(`${taskName}`, stats.toString({colors: true}));
        done && done();
    }
}

// Sets environment variable
function setEnv(buildEnv) {
    $.env({
        vars: {
            BUILD_ENV: buildEnv
        }
    });
}

// Create a new file
function newFile(name, contents) {
    //uses the node stream object
    var readableStream = require('stream').Readable({ objectMode: true });
    //reads in our contents string
    readableStream._read = function () {
      this.push(new util.File({ cwd: "", base: "", path: name, contents: new Buffer.from(contents) }));
      this.push(null);
    }
    return readableStream;
  };

//Download Font Awesome Yaml
gulp.task('fa:download', function () {
    return request('https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.15.3/metadata/icons.yml')
        .pipe(source(tmpIcons))
        .pipe(gulp.dest(tmpFolder))
    ;
});

//Convert Yaml to JSON
gulp.task('fa:yaml', function() {
    return gulp.src(tmpFolder+'*.yml')
    .pipe(yaml({ space: 2, json: true }))
    .pipe(gulp.dest(tmpFolder));
});

//Convert Yaml to JSON
gulp.task('fa:format', function() {
    let targetJSON = {
        icons: []
    };
    var sourceJSON = require(tmpFolder+'icons.temp.json');
    Object.keys(sourceJSON).forEach(function(key) {
        let ele = sourceJSON[key];
        let icon = 'fa-' + key;
        ele.styles.forEach(function(style) {
            style = style.toLowerCase();
            if (style.startsWith('brand')) {
                targetJSON.icons.push({
                    title: 'fab ' + icon,
                    searchTerms: ele.search.terms
                });
            } else if (style.startsWith('solid')) {
                targetJSON.icons.push({
                    title: 'fas ' + icon,
                    searchTerms: ele.search.terms
                });
            } else if (style.startsWith('regular')) {
                targetJSON.icons.push({
                    title: 'far ' + icon,
                    searchTerms: ele.search.terms
                });
            } else if (style.startsWith('light')) {
                targetJSON.icons.push({
                    title: 'fal ' + icon,
                    searchTerms: ele.search.terms
                });
            }
        });
    });
    return newFile('icons.json', JSON.stringify(targetJSON.icons))
    .pipe(gulp.dest(prodFolder));
});

// Build FA
gulp.task('fa', gulp.series('fa:download','fa:yaml','fa:format'));

// Clean folder
gulp.task('clean', () =>
    del([`${libFolder}/**/*`])
);

// Run Babel only
gulp.task('build-babel', gulp.series('clean'), () =>
    gulp.src([sources])
        .pipe($.babel())
        // Output files
        .pipe(gulp.dest(libFolder))
);

// Webpack helper
gulp.task('webpack:build-web', done => {
    var env = {'BUILD_ENV': 'PROD', 'TARGET_ENV': 'WEB'};
    var taskName = 'webpack:build-web';
    // run webpack
    webpack(webpackConfig(env, {mode: 'production'}), onBuild(done, taskName));
});

// Build for web
gulp.task('build-web', gulp.series('fa','webpack:build-web'/*, 'css'*/));


// Webpack watch helper
// create a single instance of the compiler to allow caching
var webDevCompiler = null;
gulp.task('webpack:build-web-dev', done => {
    var env = {'BUILD_ENV': 'DEV', 'TARGET_ENV': 'WEB'};
    var taskName = 'webpack:build-web-dev';
    // build dev compiler
    if (!webDevCompiler) {
        webDevCompiler = webpack(webpackConfig(env, {mode: 'development'}));
    }
    // run webpack
    webDevCompiler.run(onBuild(done, taskName));
});

// Build for web + watch
gulp.task('build-web-dev', () => {
    gulp.watch([sources], gulp.series('webpack:build-web-dev'));
    //gulp.watch(['./_build/assets/sass/**/*.scss'], ['css']);
});

gulp.task('default', gulp.series('build-web'));