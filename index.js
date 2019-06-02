'use strict';

var mapStream = require('map-stream');
var colors = require('ansi-colors');
var jsonlint = require('@prantlf/jsonlint');
var through = require('through2');
var PluginError = require('plugin-error');
var log = require('fancy-log');

var formatOutput = function (msg) {
    var output = {};

    if (msg) { output.message = msg; }

    output.success = msg ? false : true;

    return output;
};

var jsonLintPlugin = function (options) {
    options = Object.assign({
        mode: 'json',
        ignoreComments: false,
        ignoreTrailingCommas: false,
        allowSingleQuotedStrings: false,
        allowDuplicateObjectKeys: true
    }, options);

    return mapStream(function (file, cb) {
        var errorMessage = '';

        var parserOptions = {
            mode: options.mode,
            ignoreComments: options.ignoreComments || options.cjson ||
                            options.mode === 'cjson' || options.mode === 'json5',
            ignoreTrailingCommas: options.ignoreTrailingCommas || options.mode === 'json5',
            allowSingleQuotedStrings: options.allowSingleQuotedStrings || options.mode === 'json5',
            allowDuplicateObjectKeys: options.allowDuplicateObjectKeys,
            limitedErrorInfo: !(options.ignoreComments || options.cjson || options.allowSingleQuotedStrings)
        };
        try {
            jsonlint.parse(String(file.contents), parserOptions);
        }
        catch (err) {
            errorMessage = err.message;
        }
        file.jsonlint = formatOutput(errorMessage);

        cb(null, file);
    });
};

var defaultReporter = function (file) {
    log(colors.yellow('Error on file ') + colors.magenta(file.path));
    log(colors.red(file.jsonlint.message));
};

jsonLintPlugin.reporter = function (customReporter) {
    var reporter = defaultReporter;

    if (typeof customReporter === 'function') {
        reporter = customReporter;
    }

    return mapStream(function (file, cb) {
        if (file.jsonlint && !file.jsonlint.success) {
            reporter(file);
        }
        return cb(null, file);
    });
};

/**
 * Fail when an jsonlint error is found in jsonlint results.
 */
jsonLintPlugin.failOnError = function() {

    return through.obj(function (file, enc, cb) {
        var error;
        if (file.jsonlint.success === false) {
            error = new PluginError(
                'gulp-jsonlint',
                {
                    name: 'JSONLintError',
                    filename: file.path,
                    message: file.jsonlint.message,
                }
            );
        }

        return cb(error, file);
    });
};

/**
 * Fail when the stream ends if any jsonlint error(s) occurred
 */
jsonLintPlugin.failAfterError = function () {
    var errorCount = 0;

    return through.obj(function (file, enc, cb) {
        errorCount += file.jsonlint.success === false;

        cb(null, file);

    }, function (cb) {
        if (errorCount > 0) {
            this.emit('error', new PluginError(
                'gulp-jsonlint',
                {
                    name: 'JSONLintError',
                    message: 'Failed with ' + errorCount +
                        (errorCount === 1 ? ' error' : ' errors')
                }
            ));
        }

        cb();
    });
};

module.exports = jsonLintPlugin;
