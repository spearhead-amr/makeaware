const gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    path = require('path'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    postcss = require('gulp-postcss'),
    replace = require('gulp-replace'),
    browserSync = require('browser-sync').create();

const cssWatch = [
    'assets/stylus/*.styl',
    'assets/stylus/**/*.styl'
];

const htmlFiles = [
    '*.html',
    'components/**/*.html'
];

const jsFiles = [
    'assets/js/**/*.js'
];

const cssFiles = [
    'assets/css/**/*.css'
];

// Development mode: replace /makeaware/ paths with / and add CSS links
function replacePaths() {
    return gulp.src(['*.html', 'components/**/*.html', 'assets/js/**/*.js'], { base: '.' })
        .pipe(replace(/\/makeaware\//g, '/'))
        // Add CSS link to main HTML files (not components)
        .pipe(replace(
            /<title>.*?<\/title>/,
            function(match, offset, string) {
                // Check if this is a main HTML file (contains DOCTYPE and not in components folder)
                if (string.includes('<!DOCTYPE html>') && !this.file.path.includes('components/')) {
                    return match + '\n\t<!-- Critical CSS - load immediately -->\n\t<link rel="stylesheet" href="/assets/css/main.css">';
                }
                return match;
            }
        ))
        .pipe(gulp.dest('./dev/'));
}

// Copy assets (images, fonts, etc.) to dev folder
function copyAssets() {
    return gulp.src(['assets/img/**/*', 'assets/fonts/**/*', 'assets/icons/**/*', 'assets/csv/**/*', 'assets/json/**/*', 'site.webmanifest', 'robots.txt'], { 
        base: '.',
        encoding: false  // Treat files as binary to prevent corruption
    })
        .pipe(gulp.dest('./dev/'));
}

function cssUpdateDev() {
    return gulp
        .src('assets/stylus/main.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus())
        .pipe(replace(/\/makeaware\//g, '/'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dev/assets/css'))
        .pipe(browserSync.stream());
}

function cssUpdate() {
    return gulp
        .src('assets/stylus/main.styl')
        .pipe(sourcemaps.init())
        .pipe(stylus())
        //Sembra che il postcss stia bloccando tutto il processo
        // .pipe(postcss([
        //     autoprefixer(),
        //     cssnano()
        // ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.stream());
}

function serve() {
    browserSync.init({
        server: {
            baseDir: './dev/'
        },
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    });

    gulp.watch(cssWatch, cssUpdateDev);
    gulp.watch(htmlFiles, replacePaths);
    gulp.watch(jsFiles, replacePaths);
    gulp.watch(['assets/img/**/*', 'assets/fonts/**/*', 'assets/icons/**/*', 'assets/csv/**/*', 'assets/json/**/*'], copyAssets);
    gulp.watch("dev/*.html").on('change', browserSync.reload);
    gulp.watch("dev/**/*.html").on('change', browserSync.reload);
    gulp.watch("dev/**/*.js").on('change', browserSync.reload);
}

// function serveProd() {
//     browserSync.init({
//         server: {
//             baseDir: './'
//         },
//         ghostMode: {
//             clicks: false,
//             forms: false,
//             scroll: false
//         }
//     });

//     gulp.watch(cssWatch, cssUpdate);
//     gulp.watch("*.html").on('change', browserSync.reload);
// }

gulp.task('default', gulp.series(gulp.parallel(replacePaths, copyAssets), cssUpdateDev, cssUpdate, serve));
gulp.task('dev', gulp.series(gulp.parallel(replacePaths, copyAssets), cssUpdateDev, cssUpdate, serve));
gulp.task('cssUpdate', gulp.parallel(cssUpdate));
gulp.task('replacePaths', replacePaths);
gulp.task('copyAssets', copyAssets);