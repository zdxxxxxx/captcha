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







//qa相关
//style.min.js
gulp.task('build-css', function() {
    return gulp.src('src/style/style.css')
        .pipe(minifyCSS())
        .pipe(rename(`style.min.css`))
        .pipe(gulp.dest('qa/')); //最后生成出来
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
        .pipe(gulp.dest(`qa/`));
});


// sdk.min.js
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
        .pipe(gulp.dest(`qa/`));
});



//dev
//style.min.js
gulp.task('build-css-dev', function() {
    return gulp.src('src/style/style.css')
        .pipe(minifyCSS())
        .pipe(rename(`style.min.css`))
        .pipe(gulp.dest('dev/')); //最后生成出来
});
// smcp.min.js
gulp.task("browserify-a-dev", function () {
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
        .pipe(gulp.dest(`dev/`));
});


// sdk.min.js
gulp.task("browserify-b-dev", function () {
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
        .pipe(gulp.dest(`dev/`));
});

// 监视文件变化，自动执行任务
gulp.task('watch', function () {
    gulp.watch('src/**/*.*',['build-dev']);
});
gulp.task('build',['browserify-a','browserify-b','build-css']);
gulp.task('build-dev',['browserify-a-dev','browserify-b-dev','build-css-dev']);

