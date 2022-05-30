import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import htmlmin from 'gulp-htmlmin';
import del from 'del';
import imagemin from 'gulp-imagemin';


export const clean = () => {
  return del("build");
};

// Styles
export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Copy
export const copy = (done) => {
  gulp.src([
      "source/fonts/*.{woff2,woff}",
      "source/*.ico",
      "source/image/**/*.{jpg,png,svg}",
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"))
  done();
}

// Images
export const images = () => {
  return gulp.src('source/image/**/*.{jpg, png, svg}')
    .pipe(imagemin([
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/image'));
}

export const build = gulp.series(
  clean,
  styles,
  html,
  copy,
  images
);

// Server
export const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
export const reload = (done) => {
  browser.reload();
  done();
}

// Watcher
export const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html, reload));
}


export default gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    copy,
  ),
  gulp.series(
    server,
    watcher
  )
);
