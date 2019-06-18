# gulp-jsonlint [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> [JSON]/[JSON5] file syntax validation plugin for [`gulp`] using [`jsonlint`]

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
var log = require('fancy-log');

var myCustomReporter = function (file) {
    log('File ' + file.path + ' is not valid JSON.');
};

gulp.src('./src/*.json')
    .pipe(jsonlint())
    .pipe(jsonlint.reporter(myCustomReporter));
```

## API

### jsonlint(options)

Options can be passed as keys in an object to the `jsonlint` function. The following are their defaults:

    jsonlint({
        // parsing
        mode: 'json',
        ignoreComments: false,
        ignoreTrailingCommas: false,
        allowSingleQuotedStrings: false,
        allowDuplicateObjectKeys: true,
        // formatting
        format: false,
        indent: 2,
        sortKeys: false
    })

* `mode`, when set to "cjson" or "json5", enables some other flags automatically
* `ignoreComments`, when `true` JavaScript-style single-line and multiple-line comments will be recognised and ignored
* `ignoreTrailingCommas`, when `true` trailing commas in objects and arrays will be ignored
* `allowSingleQuotedStrings`, when `true` single quotes will be accepted as alternative delimiters for strings
* `allowDuplicateObjectKeys`, when `false` duplicate keys in objects will be reported as an error

* `format`, when `true` `JSON.stringify` will be used to format the JavaScript (if it is valid)
* `indent`, the value passed to `JSON.stringify`, it can be the number of spaces, or string like "\t"
* `sortKeys`, when `true` keys of objects in the output JSON will be sorted alphabetically (`format` has to be set to `true` too)

### jsonlint.reporter(customReporter)

#### customReporter(file)

Type: `function`

You can pass a custom reporter function. If ommited then the default reporter will be used.

The `customReporter` function will be called with the argument `file`.

##### file

Type: `object`

This argument has the attribute `jsonlint` wich is an object that contains a `success` boolean attribute. If it's false you also have a `message` attribute containing the jsonlint error message.

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

[MIT License]

[npm-url]: https://npmjs.org/package/gulp-jsonlint
[npm-image]: https://badge.fury.io/js/gulp-jsonlint.svg

[travis-url]: http://travis-ci.org/rogeriopvl/gulp-jsonlint
[travis-image]: https://secure.travis-ci.org/rogeriopvl/gulp-jsonlint.svg?branch=master

[depstat-url]: https://david-dm.org/rogeriopvl/gulp-jsonlint
[depstat-image]: https://david-dm.org/rogeriopvl/gulp-jsonlint.svg

[MIT License]: http://en.wikipedia.org/wiki/MIT_License
[`gulp`]: http://gulpjs.com/
[`jsonlint`]: https://prantlf.github.io/jsonlint/
[JSON]: https://tools.ietf.org/html/rfc8259
[JSON5]: https://spec.json5.org
