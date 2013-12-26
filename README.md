# gulp-jsonlint [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> jsonlint plugin for [gulp](https://github.com/wearefractal/gulp)

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

## API

### jsonlint(options)

For now, `options` are not supported yet.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-jsonlint
[npm-image]: https://badge.fury.io/js/gulp-jsonlint.png

[travis-url]: http://travis-ci.org/rogeriopvl/gulp-jsonlint
[travis-image]: https://secure.travis-ci.org/rogeriopvl/gulp-jsonlint.png?branch=master

[depstat-url]: https://david-dm.org/rogeriopvl/gulp-jsonlint
[depstat-image]: https://david-dm.org/rogeriopvl/gulp-jsonlint.png
