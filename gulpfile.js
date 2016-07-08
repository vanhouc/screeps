
"use strict";

var gulp = require('gulp');
var webpack = require('gulp-webpack');
var tsproject = require('tsproject');
var https = require('https');
var fs = require('fs');
var secrets = require('./secrets.js');

gulp.task('compile', function () {
    return gulp.src('./src/')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('./dist/'))
});
gulp.task('upload-sim', ['compile'], function () {
    console.log("Starting upload");
    var email = secrets.email,
        password = secrets.password,
        data = {
            branch: 'default',
            modules: { main: fs.readFileSync('./dist/screeps.js', { encoding: "utf8" }) }
        };
    var req = https.request({
        hostname: 'screeps.com',
        port: 443,
        path: '/api/user/code',
        method: 'POST',
        auth: email + ':' + password,
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }, function (res) {
        console.log("Response: " + res.statusCode);
    });

    req.write(JSON.stringify(data));
    req.end();
});

gulp.task('watch', function () {
    gulp.watch('./src/**/*.ts', ['build']);
});

gulp.task('build', ['upload-sim']);

gulp.task('default', ['watch']);