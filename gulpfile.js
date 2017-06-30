var gulp = require('gulp');
var babel = require('babelify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var entry = gulp.env.entry || 'smcp';

function swallowError(error) {
    // If you want details of the error in the console
    console.error(error.toString())
    this.emit('end')
}
// 编译并压缩js
gulp.task('convertJS', function () {
    return gulp.src(`build/${entry}/bundle.js`)
        .pipe(uglify())
        .pipe(rename(`${entry}.min.js`))
        .pipe(gulp.dest(`build/${entry}`))
})
// 监视文件变化，自动执行任务
gulp.task('watchJS', function () {
    gulp.watch('src/**/*.js', ['browserify']);
})

// browserify
gulp.task("browserify", function () {
    var b = browserify({
        entries: `src/${entry}/main.js`
    });
    return b.transform(babel.configure({
            presets: ['es2015']
        }))
        .bundle()
        .on('error', swallowError)
        .pipe(source(`${entry}.js`))
        .pipe(gulp.dest(`build/${entry}/`));
});

gulp.task('watch', ['browserify', 'watchJS']);
gulp.task('build', ['browserify', 'convertJS'])