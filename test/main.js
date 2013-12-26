/*global describe, it*/
"use strict";

var fs = require("fs");
var path = require('path');
var es = require("event-stream");
var should = require("should");

var jsonLintPlugin = require('../');

require("mocha");

var gutil = require("gulp-util"),
    jsonlint = require("../");

var getFile = function(filePath) {
    filePath = 'test/' + filePath;

    return new gutil.File({
        path: filePath,
        cwd: 'test/',
        base: path.dirname(filePath),
        contents: fs.readFileSync(filePath)
    });
};

describe("gulp-jsonlint", function () {

    it('should pass file through', function(done) {
        var cbCounter = 0;

        var file = getFile('fixtures/valid.json');

        var stream = jsonLintPlugin();

        stream.on('data', function(f) {
            should.exist(f);
            should.exist(f);
            should.exist(f.relative);
            should.exist(f.contents);
            f.path.should.equal('test/fixtures/valid.json');
            f.relative.should.equal('valid.json');
            ++cbCounter;
        });

        stream.once('end', function() {
            cbCounter.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

    it('should send success status when json is valid', function(done) {
        var cbCounter = 0;

        var file = getFile('fixtures/valid.json');

        var stream = jsonLintPlugin();

        stream.on('data', function(f) {
            ++cbCounter;
            should.exist(f.jsonlint.success);
            f.jsonlint.success.should.equal(true);
            should.not.exist(f.jsonlint.message);
        });

        stream.once('end', function() {
            cbCounter.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

    it('should send jsonlint error message when json is invalid', function(done) {
        var cbCounter = 0;

        var file = getFile('fixtures/invalid.json');

        var stream = jsonLintPlugin();

        stream.on('data', function(f) {
            ++cbCounter;
            should.exist(f.jsonlint.success);
            f.jsonlint.success.should.equal(false);
            should.exist(f.jsonlint.message);
            f.jsonlint.message.should.match(/^Parse error/);
        });

        stream.once('end', function() {
            cbCounter.should.equal(1);
            done();
        });

        stream.write(file);
        stream.end();
    });

    it('should lint more than one file', function(done) {
        var cbCounter = 0;
        var file1 = getFile('fixtures/invalid.json');
        var file2 = getFile('fixtures/valid.json');

        var stream = jsonLintPlugin();

        stream.on('data', function(f) {
            ++cbCounter;
        });

        stream.once('end', function() {
            cbCounter.should.equal(2);
            done();
        });

        stream.write(file1);
        stream.write(file2);
        stream.end();
    });
});
