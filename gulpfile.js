var gulp = require('gulp');
var livereload = require('gulp-livereload');
var jade = require('gulp-jade');
var riot = require('gulp-riot');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var stylus = require('gulp-stylus');
var jeet = require('jeet');
var rupture = require('rupture');
var axis = require('axis');
var es = require('event-stream');

gulp.task('default', function() {
    gulp.watch(['app/jade/*.jade'], ['jade']);
    gulp.watch(['app/tags/*.jtag'], ['riot']);
    gulp.watch(['app/tags/*.tag'], ['riot']);
    gulp.watch(['app/stylus/*.styl'], ['styles']);
    gulp.watch(['app/javascripts/*.js'], ['scripts']);
    livereload.listen();
});

gulp.task('jade', function () {
    gulp.src('app/jade/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('app/public'))
        .pipe(livereload());
});

gulp.task('riot', function () {
    var jtag = gulp.src('app/tags/*.jtag')
        .pipe(riot({ 
            template: "jade",
            ext: "jtag"
        }));
    var tag = gulp.src('app/tags/*.tag')
        .pipe(riot());
    es.merge(jtag, tag)
        .pipe(concat('all-tags.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/public/js'))
        .pipe(livereload());
});

gulp.task('styles', function() {
    gulp.src('app/stylus/*.styl')
        .pipe(stylus({
            use: [jeet(), rupture(), axis()]
        }))
        .pipe(concat('main.css'))
        .pipe(cssmin())
        .pipe(gulp.dest('app/public/css'))
        .pipe(livereload());
});

gulp.task('scripts', function() {
    gulp.src('app/javascripts/*.js')
        .pipe(concat('global.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/public/js'))
        .pipe(livereload());
});