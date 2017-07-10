var gulp = require('gulp');
var babel = require('babelify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var entry = gulp.env.entry || 'smcp';
var minifyCSS = require('gulp-minify-css');
var buffer = require('vinyl-buffer');
function swallowError(error) {
    // If you want details of the error in the console
    console.error(error.toString());
    this.emit('end')
}

//watch相关


gulp.task('css', function() {
    return gulp.src('src/style/style.css')
        .pipe(gulp.dest('build/style'));
});

// 监视文件变化，自动执行任务
gulp.task('watchJS', function () {
    gulp.watch('src/**/*.*',['browserify-c','browserify-d','css']);
});

// smcp watch
gulp.task("browserify-c", function () {
    var b = browserify({
        entries: `src/smcp/main.js`
    });
    return b.transform(babel.configure({
            presets: ['es2015']
        }))
        .bundle()
        .on('error', swallowError)
        .pipe(source(`smcp.js`))
        .pipe(gulp.dest(`build/smcp/`));
});

// sdk watch
gulp.task("browserify-d", function () {
    var b = browserify({
        entries: `src/sdk/main.js`
    });
    return b.transform(babel.configure({
        presets: ['es2015']
    }))
        .bundle()
        .on('error', swallowError)
        .pipe(source(`sdk.js`))
        .pipe(gulp.dest(`build/sdk/`));
});

gulp.task('watch', ['browserify-c', 'browserify-d','css','watchJS']);




//dist相关
gulp.task('build-css', function() {
    return gulp.src('src/style/style.css')
        .pipe(minifyCSS())
        .pipe(rename(`style.min.css`))
        .pipe(gulp.dest('dist/')); //最后生成出来
});
// smcp.min.js
gulp.task("browserify-a", function () {
    var b = browserify({
        entries: `src/smcp/main.js`
    });
    return b.transform(babel.configure({
        presets: ['es2015']
    }))
        .bundle()
        .on('error', swallowError)
        .pipe(source(`smcp.min.js`))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(`dist/`));
});


// sdk
gulp.task("browserify-b", function () {
    var b = browserify({
        entries: `src/sdk/main.js`
    });
    return b.transform(babel.configure({
        presets: ['es2015']
    }))
        .bundle()
        .on('error', swallowError)
        .pipe(source(`captcha-sdk.min.js`))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(`dist/`));
});


gulp.task('build',['browserify-a','browserify-b','build-css']);

