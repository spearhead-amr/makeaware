const gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    path = require('path'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    postcss = require('gulp-postcss'),
    browserSync = require('browser-sync').create();

const cssWatch = [
    'assets/stylus/*.styl',
    'assets/stylus/**/*.styl'
];

function cssUpdate() {
    return gulp
        .src('assets/stylus/main.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(postcss([
            autoprefixer(),
            cssnano()
        ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.stream());
}

function serve() {
    browserSync.init({
        server: {
            baseDir: './'
        }
    });

    gulp.watch(cssWatch, cssUpdate);
    gulp.watch("*.html").on('change', browserSync.reload);
}

gulp.task('default', gulp.parallel(serve));