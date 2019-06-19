var gulp = require('gulp')
var jsonlint = require('.')

gulp.task('valid', function() {
  return gulp.src('./test/fixtures/valid.json')
    .pipe(jsonlint())
})

gulp.task('one', function() {
  return gulp.src('./test/fixtures/invalid.json')
    .pipe(jsonlint())
    .pipe(jsonlint.failOnError())
})

gulp.task('two', function() {
  return gulp.src('./test/fixtures/comments.json')
    .pipe(jsonlint())
    .pipe(jsonlint.reporter())
    .pipe(jsonlint.failAfterError())
})

gulp.task('three', function() {
  return gulp.src('./test/fixtures/json5.json')
    .pipe(jsonlint())
    .pipe(jsonlint.reporter({}))
    .pipe(jsonlint.failAfterError())
})

gulp.task('all', function() {
  return gulp.src('./test/fixtures/*.json')
    .pipe(jsonlint())
    .pipe(jsonlint.reporter({
      formatter: 'msbuild',
      reporter: 'jshint'
    }))
    .pipe(jsonlint.failAfterError())
})
