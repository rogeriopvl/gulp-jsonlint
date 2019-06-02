/*global describe, it*/
'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var Vinyl = require('vinyl');

var jsonLintPlugin = require('../');

function getFile (filePath) {
    filePath = path.join('test', filePath);
    return new Vinyl({
        path: filePath,
        cwd: 'test/',
        base: path.dirname(filePath),
        contents: fs.readFileSync(filePath)
    });
}

function parseValidFile (filePath, done, options) {
    var file = getFile(filePath);
    var stream = jsonLintPlugin(options);

    stream.on('data', function (f) {
        should.exist(f.jsonlint.success);
        f.jsonlint.success.should.equal(true);
    });

    stream.once('end', done);
    stream.write(file);
    stream.end();
}

function parseInvalidFile (filePath, done, options) {
    var file = getFile(filePath);
    var stream = jsonLintPlugin(options);

    stream.on('data', function (f) {
        should.exist(f.jsonlint.success);
        f.jsonlint.success.should.equal(false);
    });

    stream.once('end', done);
    stream.write(file);
    stream.end();
}

describe('gulp-jsonlint', function () {
    it('should pass file through', function (done) {
        var cbCounter = 0;
        var file = getFile('fixtures/valid.json');
        var stream = jsonLintPlugin();

        stream.on('data', function (f) {
            should.exist(f);
            should.exist(f.relative);
            should.exist(f.contents);
            f.path.should.equal('test/fixtures/valid.json');
            f.relative.should.equal('valid.json');
            ++cbCounter;
        });

        stream.once('end', function () {
            cbCounter.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

    it('should send success status when json is valid', function (done) {
        var cbCounter = 0;
        var file = getFile('fixtures/valid.json');
        var stream = jsonLintPlugin();

        stream.on('data', function (f) {
            ++cbCounter;
            should.exist(f.jsonlint.success);
            f.jsonlint.success.should.equal(true);
            should.not.exist(f.jsonlint.message);
        });

        stream.once('end', function () {
            cbCounter.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

    it('should send jsonlint error message when json is invalid', function (done) {
        var cbCounter = 0;
        var file = getFile('fixtures/invalid.json');
        var stream = jsonLintPlugin();

        stream.on('data', function (f) {
            ++cbCounter;
            should.exist(f.jsonlint.success);
            f.jsonlint.success.should.equal(false);
            should.exist(f.jsonlint.message);
            f.jsonlint.message.should.match(/^Parse error/);
        });

        stream.once('end', function () {
            cbCounter.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

    it('should lint more than one file', function (done) {
        var cbCounter = 0;
        var file1 = getFile('fixtures/invalid.json');
        var file2 = getFile('fixtures/valid.json');
        var stream = jsonLintPlugin();

        stream.on('data', function () {
            ++cbCounter;
        });

        stream.once('end', function () {
            cbCounter.should.equal(2);
            done();
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });

    it('supports option for ignoring comments', function (done) {
        parseValidFile('fixtures/comments.json', done, {
            ignoreComments: true
        });
    });

    it('supports option for ignoring trailing commas', function (done) {
        parseValidFile('fixtures/trailing-commas.json', done, {
            ignoreTrailingCommas: true
        });
    });

    it('supports option for allowing single-quoted strings', function (done) {
        parseValidFile('fixtures/single-quotes.json', done, {
            allowSingleQuotedStrings: true
        });
    });

    it('does not report duplicate object keys as an error by default', function (done) {
        parseValidFile('fixtures/duplicate-object-keys.json', done);
    });

    it('supports option for disallowing single-quoted strings', function (done) {
        parseInvalidFile('fixtures/duplicate-object-keys.json', done, {
            allowDuplicateObjectKeys: false
        });
    });

    it('ignores comments in the "cjson" mode', function (done) {
        parseValidFile('fixtures/comments.json', done, {
            mode: 'cjson'
        });
    });

    it('accepts JSON5 format in the "json5" mode', function (done) {
        parseValidFile('fixtures/json5.json', done, {
            mode: 'json5'
        });
    });
});
