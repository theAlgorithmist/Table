// build and optionally execute the Table anlaysis demo in a more production-worthy setting 
const gulp        = require('gulp');                    // gulp it, baby
const typescript  = require('gulp-typescript');         // TS
const tscConfig   = require('./tsconfig-prod.json');    // Production TS config file
const liveServer  = require('gulp-server-livereload');  // Live server w/reload or try browserSynch
const concatCss   = require('gulp-concat-css');         // concat CSS files 
const concat      = require('gulp-concat');             // file concat
const rename      = require('gulp-rename');             // rename
const insert      = require('gulp-insert');             // file modification
const runSequence = require('run-sequence');            // force sequentional sub-tasks (pre 4.0)

// suggestion - as an exercise, add minification (although beware an issue with minimizing angular2 that is still present beta 12) 

// copy html file
gulp.task('copy:html', function() {
  return gulp.src(['src/index-prod.html'])
    .pipe(rename('index.html'))
    .pipe(gulp.dest('prod'))
});

// copy template files
gulp.task('copy:templates', function() {
  return gulp.src(['src/app/templates/*.html'])
    .pipe(gulp.dest('prod/app/templates'))
});

// build/copy css files - the 'build' part is for you.  I'm a mathematician.  I don't build CSS :)
gulp.task('copy:css', function() {
  return gulp.src(['src/css/**/*.css'])
     .pipe(concatCss("tbl-app.css"))
     .pipe(gulp.dest("prod/css"))
});

// copy assets
gulp.task('copy:assets', function() {
  return gulp.src(['src/assets/**/*'])
    .pipe(gulp.dest('prod/assets'))
});

// copy data file(s)
gulp.task('copy:data', function() {
  return gulp.src(['src/app/data/*'])
    .pipe(gulp.dest('prod/app/data'))
});

// bundle framework
gulp.task('bundle:framework', function() {
  return gulp.src([
      'node_modules/es6-shim/es6-shim.min.js',
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/angular2/bundles/angular2-polyfills.min.js',
      'node_modules/systemjs/dist/system.js',
      'node_modules/rxjs/bundles/Rx.min.js',
      'node_modules/angular2/bundles/angular2.js',
      'node_modules/angular2/bundles/http.min.js'
    ] )
    .pipe(concat('a2-bundle.js'))
    .pipe(gulp.dest('prod/js'))
});

// modify the boot.ts file to put angular2 in production
gulp.task('modify:boot', function() {
  return gulp.src('src/app/boot.ts')
  .pipe(insert.prepend("import {enableProdMode} from 'angular2/core';\nenableProdMode();\n\n"))
  .pipe(gulp.dest('prod/app'));
});

// bundle the app files (see tsconfig-prod.json)
gulp.task('bundle:app', function () {
    return gulp
    .src([
      'typings/browser/ambient/es6-promise/es6-promise.d.ts',
      'typings/browser/ambient/es6-collections/es6-collections.d.ts', 
      './src/app/**/*.ts'
    ])
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(gulp.dest('prod/js'));
});

// serve 
gulp.task('serve', function() {
  gulp.src('./prod')
    .pipe(liveServer({
      livereload: true,
      defaultFile: 'index.html',
      open: true
    }));
});

gulp.task('copy:all', ['copy:html', 'copy:templates', 'bundle:framework', 'copy:css', 'copy:assets', 'copy:data']);

// just what I need ... an excuse to play with runSequence ...
gulp.task('build:all', function(callback) {
  runSequence(['copy:all', 'modify:boot'],
              'bundle:app',
              callback);
});