# gulp-jsonlint [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> jsonlint plugin for [gulp](http://gulpjs.com/)

## Usage

First, install `gulp-jsonlint` as a development dependency:

```shell
npm install --save-dev gulp-jsonlint
```

Then, add it to your `gulpfile.js`:

```javascript
var jsonlint = require("gulp-jsonlint");

gulp.src("./src/*.json")
    .pipe(jsonlint())
    .pipe(jsonlint.reporter());
```

Using a custom reporter:

```javascript
var jsonlint = require('gulp-jsonlint');
var gutil = require('gulp-util');

var myCustomReporter = function (file) {
    gutil.log('File ' + file.path + ' is not valid JSON.');
};

gulp.src('./src/*.json')
    .pipe(jsonlint())
    .pipe(jsonlint.reporter(myCustomReporter));
```

## API

### jsonlint(options)

#### options

Type: `object`

Options to pass to `jsonlint`.

##### comments

Type: `boolean`  
Default: `false`

Whether or not to allow comments in the `JSON` files.

### jsonlint.reporter(customReporter)

#### customReporter(file)

Type: `function`

You can pass a custom reporter function. If omitted then the default reporter will be used.

The `customReporter` function will be called with the argument `file`.

##### file

Type: `object`

This argument has the attribute `jsonlint` which is an object that contains a `success` boolean attribute. If it's false you also have a `message` attribute containing the jsonlint error message.

### jsonlint.failOnError()

Stop a task/stream if an jsonlint error has been reported for any file.

```javascript
// Cause the stream to stop(/fail) before copying an invalid JS file to the output directory
gulp.src('**/*.js')
	.pipe(jsonlint())
	.pipe(jsonlint.failOnError())
	.pipe(gulp.dest('../output'));
```

### jsonlint.failAfterError()

Stop a task/stream if an jsonlint error has been reported for any file, but wait for all of them to be processed first.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-jsonlint
[npm-image]: https://badge.fury.io/js/gulp-jsonlint.svg

[travis-url]: http://travis-ci.org/rogeriopvl/gulp-jsonlint
[travis-image]: https://secure.travis-ci.org/rogeriopvl/gulp-jsonlint.svg?branch=master

[depstat-url]: https://david-dm.org/rogeriopvl/gulp-jsonlint
[depstat-image]: https://david-dm.org/rogeriopvl/gulp-jsonlint.svg
