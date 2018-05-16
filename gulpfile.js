var gulp = require("gulp"),
    browserify = require("browserify"),
    tslint = require("gulp-tslint"),
    tsc = require("gulp-typescript"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    sourcemaps = require("gulp-sourcemaps"),
    uglify = require("gulp-uglify"),
    runSequence = require("run-sequence"),
    tsProject = tsc.createProject("tsconfig.json");

gulp.task("lint", function () {
    return gulp.src("types/**/**.ts")
        .pipe(tslint({}))
        .pipe(tslint.report());
});

gulp.task("build", function () {
    return gulp.src("types/**/**.ts")
        .pipe(tsProject())
        .js.pipe(gulp.dest("build/"));
});

gulp.task("bundle", function () {
    var libraryName = "mookgen-types";
    var mainTsFilePath = "build/types.js";
    var outputFolder = "dist/";
    var outputFileName = libraryName + ".min.js";

    var bundler = browserify({
        debug: false,
        standalone: libraryName
    });

    return bundler.add(mainTsFilePath)
        .bundle()
        .pipe(source(outputFileName))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(outputFolder));
});

gulp.task("rebundle", ["lint", "build", "bundle"], function () { })