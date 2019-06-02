'use strict';

var fs = require('fs');
var mapStream = require('map-stream');
var colors = require('ansi-colors');
var jsonlint = require('@prantlf/jsonlint');
var validator = require('@prantlf/jsonlint/lib/validator');
var sorter = require('@prantlf/jsonlint/lib/sorter');
var through = require('through2');
var PluginError = require('plugin-error');
var log = require('fancy-log');

var jsonLintPlugin = function (options) {
    options = Object.assign({
        mode: 'json',
        ignoreComments: false,
        ignoreTrailingCommas: false,
        allowSingleQuotedStrings: false,
        allowDuplicateObjectKeys: true,
        schema: {},
        format: false,
        indent: 2,
        sortKeys: false
    }, options);
    var schema = options.schema;
    var parserOptions = {
        mode: options.mode,
        ignoreComments: options.ignoreComments || options.cjson ||
                        options.mode === 'cjson' || options.mode === 'json5',
        ignoreTrailingCommas: options.ignoreTrailingCommas || options.mode === 'json5',
        allowSingleQuotedStrings: options.allowSingleQuotedStrings || options.mode === 'json5',
        allowDuplicateObjectKeys: options.allowDuplicateObjectKeys,
        environment: schema.environment
    };
    var schemaContent;

    function createResult (message) {
        var result = {};
        if (message) {
            result.message = message;
            result.success = false;
        } else {
            result.success = true;
        }
        return result;
    }

    function formatOutput (parsedData, file) {
        if (options.format) {
            if (options.sortKeys) {
              parsedData = sorter.sortObject(parsedData);
            }
            var formatted = JSON.stringify(parsedData, null, options.indent) + '\n';
            file.contents = new Buffer(formatted);
        }
    }

    function validateSchema (parsedData, file, finish) {
        var errorMessage;
        try {
            var validate = validator.compile(schemaContent, parserOptions);
            validate(parsedData);
            formatOutput(parsedData, file);
        }
        catch (error) {
            errorMessage = error.message;
        }
        finish(errorMessage);
    }

    function loadAndValidateSchema (parsedData, file, finish) {
        if (schemaContent) {
            validateSchema(parsedData, finish);
        } else {
            fs.readFile(schema.src, 'utf-8', function(error, fileContent) {
                if (error) {
                    finish(error.message);
                } else {
                    schemaContent = fileContent;
                    validateSchema(parsedData, file, finish);
                }
            });
        }
    }

    return mapStream(function (file, cb) {
        var errorMessage;
        function finish (errorMessage) {
            file.jsonlint = createResult(errorMessage);
            cb(null, file);
        }

        try {
            var parsedData = jsonlint.parse(String(file.contents), parserOptions);
            if (schema.src) {
                loadAndValidateSchema(parsedData, file, finish);
                return;
            }
            formatOutput(parsedData, file);
        }
        catch (error) {
            errorMessage = error.message;
        }
        finish(errorMessage);
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
