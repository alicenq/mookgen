var gulp = require("gulp"),
    browserify = require("browserify"),
    babel = require("gulp-babel"),
    tsc = require("gulp-typescript"),
    rename = require("gulp-rename"),
    sourcemaps = require("gulp-sourcemaps"),
    uglify = require("gulp-uglify"),
    del = require('del'),
    runSequence = require('run-sequence'),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),

    tsProject = tsc.createProject("tsconfig.json");

/**
 * Clean bld and dist
 */
gulp.task('prebuild-clean', function () {
    return del([
        'bld/**/*',
        'dist/**/*'
    ]);
});

/**
 * Minify everything in dist
 */
gulp.task('minify', function () {
    return gulp.src([
        'dist/**/*.js',
        'dist/**/*.css',
        'dist/**/*.html'
    ])
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify({
            mangle: false,
            output: {
                comments: false,
                ascii_only: true
            }
        }))
        .pipe(rename(function (path) {
            path.extname = '.min.js';
        }))
        .pipe(sourcemaps.write('map'))
        .pipe(gulp.dest('dist/'));
});


/**
 * Transpile javascript from EC6 to EC5
 */
gulp.task('xpile-js', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/js/'));
});

/**
 * Transpile typescript files and dump them in dist/ts
 */
gulp.task('xpile-ts', function () {
    return gulp.src('src/ts/**/*.ts')
        .pipe(tsProject())
        .js.pipe(gulp.dest("bld/js/"));
});

/**
 * Bundle all types defined in types.ts into a single file
 */
gulp.task('bundle-main', function () {
    var libraryName = "mookgen-index";
    var sourcePath = "bld/js/";
    var mapFile = "index.js";

    var bundler = browserify({
        debug: false,
        standalone: libraryName
    });

    return bundler.add(sourcePath + mapFile)
        .bundle()
        .pipe(source(libraryName + ".js"))
        .pipe(buffer())
        .pipe(gulp.dest("dist/js/"));
});

/**
 * Bundle all types defined in types.ts into a single file
 */
gulp.task('bundle-types', function () {
    var libraryName = "mg-types";
    var sourcePath = "bld/js/";
    var mapFile = "types.js";

    var bundler = browserify({
        debug: false,
        standalone: libraryName
    });

    return bundler.add(sourcePath + mapFile)
        .bundle()
        .pipe(source(libraryName + ".js"))
        .pipe(buffer())
        .pipe(gulp.dest("bld/js/"));
});

/**
 * Basically the equivalent of VS rebuild all
 */
gulp.task('build-all',
    gulp.series(
        'prebuild-clean',
        'xpile-js',
        'xpile-ts',
        // 'bundle-types',
        'bundle-main',
        'minify')
);