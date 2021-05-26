// including plugins
var gulp = require('gulp'),
  sass = require("gulp-sass"),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  plumber = require('gulp-plumber'),
  browserSync = require('browser-sync').create();

var CSS_NAME = 'main';
var JS_NAME = 'main'

function css() {
  return gulp.src('scss/' + CSS_NAME + '.scss') // path to your file
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer(
      {
        browsers: [
          '> 1%',
          'last 2 versions',
          'firefox >= 4',
          'safari 7',
          'safari 8',
          'IE 8',
          'IE 9',
          'IE 10',
          'IE 11'
        ],
        cascade: false
      }
    ))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./css/'))
    .pipe(browserSync.stream());
}

function vendorjs() {
  return gulp.src([
      'js/lib/greensock/TweenLite.min.js',
      'js/lib/greensock/easing/EasePack.min.js',
      'js/lib/greensock/plugins/CSSPlugin.min.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('js-dist/'))
    .pipe(browserSync.stream());
}

function appjs() {
  return gulp.src([
      'js/src/ui/*.js',
      'js/src/utils/*.js',
      'js/src/Main.js'
    ])
    .pipe(concat(JS_NAME + '.js'))
    .pipe(gulp.dest('js-dist/'))
    .pipe(browserSync.stream());
}

function watchfiles() {
  gulp.watch("scss/*.scss", css);
  gulp.watch(['js/lib/**/*.js', '*.json'], vendorjs);
  gulp.watch(['js/src/**/*.js', '*.json'], appjs);
  gulp.watch("./*.html").on('change', browserSync.reload);
}

function browserSyncFn(done) {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

function compressjs() {
  return gulp.src('js-dist/main.js')
    .pipe(uglify())
    .pipe(concat(JS_NAME + '.min.js'))
    .pipe(gulp.dest('js-dist'));
}

// const build = gulp.parallel(css, vendorjs, appjs);
const build = gulp.parallel(css);
const watch = gulp.parallel(watchfiles, browserSyncFn);
const compress = gulp.parallel(compressjs);

exports.serve = watch;
exports.compress = compress;
exports.default = build;
