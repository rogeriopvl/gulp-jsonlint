'use strict'

var fs = require('fs')
var mapStream = require('map-stream')
var colors = require('ansi-colors')
var jsonlint = require('@prantlf/jsonlint')
var validator = require('@prantlf/jsonlint/lib/validator')
var sorter = require('@prantlf/jsonlint/lib/sorter')
var through = require('through2')
var PluginError = require('plugin-error')
var log = require('fancy-log')

var jsonLintPlugin = function(options) {
  options = Object.assign(
    {
      mode: 'json',
      ignoreComments: false,
      ignoreTrailingCommas: false,
      allowSingleQuotedStrings: false,
      allowDuplicateObjectKeys: true,
      schema: {},
      format: false,
      indent: 2,
      sortKeys: false
    },
    options
  )
  var schema = options.schema
  // Share the same options for parsing both data and schema for simplicity.
  var parserOptions = {
    mode: options.mode,
    ignoreComments:
      options.ignoreComments ||
      options.cjson ||
      options.mode === 'cjson' ||
      options.mode === 'json5',
    ignoreTrailingCommas:
      options.ignoreTrailingCommas || options.mode === 'json5',
    allowSingleQuotedStrings:
      options.allowSingleQuotedStrings || options.mode === 'json5',
    allowDuplicateObjectKeys: options.allowDuplicateObjectKeys,
    environment: schema.environment
  }
  var schemaContent

  function createResult(error) {
    var result = {}
    if (error) {
      result.error = error
      result.message = error.message
      result.success = false
    } else {
      result.success = true
    }
    return result
  }

  function formatOutput(parsedData, file) {
    if (options.format) {
      if (options.sortKeys) {
        parsedData = sorter.sortObject(parsedData)
      }
      var formatted = JSON.stringify(parsedData, null, options.indent) + '\n'
      file.contents = Buffer.from(formatted)
    }
  }

  function validateSchema(data, file, finish) {
    var lastError
    try {
      var validate = validator.compile(schemaContent, parserOptions)
      var parsedData = validate(data, parserOptions)
      formatOutput(parsedData, file)
    } catch (error) {
      lastError = error
    }
    finish(lastError)
  }

  function loadAndValidateSchema(data, file, finish) {
    if (schemaContent) {
      validateSchema(data, finish)
    } else {
      fs.readFile(schema.src, 'utf-8', function(error, fileContent) {
        if (error) {
          finish(error)
        } else {
          schemaContent = fileContent
          validateSchema(data, file, finish)
        }
      })
    }
  }

  return mapStream(function(file, cb) {
    var lastError
    function finish(error) {
      file.jsonlint = createResult(error)
      cb(null, file)
    }

    try {
      var data = String(file.contents)
      // Parse JSON data from string by the schema validator to get
      // error messages including the location in the source string.
      if (schema.src) {
        loadAndValidateSchema(data, file, finish)
        return
      }
      var parsedData = jsonlint.parse(data, parserOptions)
      formatOutput(parsedData, file)
    } catch (error) {
      lastError = error
    }
    finish(lastError)
  })
}

const FORMATTERS = {
  prose: require('./lib/formatters/prose'),
  msbuild: require('./lib/formatters/visual-studio')
}

const REPORTERS = {
  exception: require('./lib/reporters/exception'),
  jshint: require('./lib/reporters/jshint-style')
}

function getProjectRelativeFilePath(file) {
  var filePath = file.path
  if (filePath.indexOf(__dirname) === 0) {
    return filePath.substr(__dirname.length + 1)
  }
  return filePath
}

var defaultCompleteReporter = function(file) {
  log(colors.yellow('Error on file ') + colors.magenta(file.path))
  log(colors.red(file.jsonlint.message))
}

jsonLintPlugin.reporter = function(customCompleteReporter) {
  var completeReporter = defaultCompleteReporter
  var formatter
  var reporter

  if (typeof customCompleteReporter === 'function') {
    completeReporter = customCompleteReporter
  } else if (typeof customCompleteReporter === 'object') {
    formatter = customCompleteReporter.formatter || 'prose'
    reporter = customCompleteReporter.reporter || 'exception'
    if (typeof formatter !== 'function') {
      formatter = FORMATTERS[formatter]
    }
    if (typeof reporter !== 'function') {
      reporter = REPORTERS[reporter]
    }
  }

  return mapStream(function(file, cb) {
    if (file.jsonlint && !file.jsonlint.success) {
      if (formatter) {
        var filePath = getProjectRelativeFilePath(file)
        log(
          formatter(filePath, file.jsonlint.error) +
            '\n' +
            reporter(filePath, file.jsonlint.error)
        )
      } else {
        completeReporter(file)
      }
    }
    return cb(null, file)
  })
}

/**
 * Fail when an jsonlint error is found in jsonlint results.
 */
jsonLintPlugin.failOnError = function() {
  return through.obj(function(file, enc, cb) {
    if (file.jsonlint.success === false) {
      var error = new PluginError('gulp-jsonlint', {
        name: 'JSONLintError',
        filename: file.path,
        message: file.jsonlint.message
      })
    }

    return cb(error, file)
  })
}

/**
 * Fail when the stream ends if any jsonlint error(s) occurred
 */
jsonLintPlugin.failAfterError = function() {
  var errorCount = 0

  return through.obj(
    function(file, enc, cb) {
      errorCount += file.jsonlint.success === false

      cb(null, file)
    },
    function(cb) {
      if (errorCount > 0) {
        this.emit(
          'error',
          new PluginError('gulp-jsonlint', {
            name: 'JSONLintError',
            message:
              'Failed with ' +
              errorCount +
              (errorCount === 1 ? ' error' : ' errors')
          })
        )
      }

      cb()
    }
  )
}

module.exports = jsonLintPlugin
