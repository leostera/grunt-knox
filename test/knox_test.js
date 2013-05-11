'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var knox = require('knox')
  , fs   = require('fs')
  , s3client = knox.createClient(require("./auth"));

exports.deploy = {
  setUp: function(done) {
    done();
  },
  supportsSpacesInFilename: function(test) {
    test.expect(1);

    fs.stat('./test/fixtures/File name.txt', function (err, stat) {

      if(err) {
        grunt.log.writeln("File test/fixtures/File name.txt couldn't be stat'd: ", err);
        test.done(false);
      }

      s3client.get('fixtures/File%20name.txt').on('response', function(res){

        grunt.log.writeln(res.statusCode);
        grunt.log.writeln(res.headers);
        res.on('data', function(chunk){
          test.equal(chunk.length, stat.size)
          test.done();
        });

      }).end();

    });
  },
  checkGZipIsThere: function(test) {
    test.expect(1);

    fs.stat('./test/fixtures/knox_test.gzip', function (err, stat) {

      if(err) {
        grunt.log.writeln("File test/fixtures/knox_test.gzip couldn't be stat'd: ", err);
        test.done(false);
      }

      s3client.get('fixtures/knox_test.gzip').on('response', function(res){

        grunt.log.writeln(res.statusCode);
        grunt.log.writeln(res.headers);
        res.on('data', function(chunk){
          test.equal(chunk.length, stat.size)
          test.done();
        });

      }).end();

    });
  },
  checkIndexIsThere: function(test) {
    test.expect(1);

    fs.stat('./test/fixtures/index.html', function (err, stat) {

      if(err) {
        grunt.log.writeln("File test/fixtures/index.html couldn't be stat'd: ", err);
        test.done(false);
      }

      s3client.get('fixtures/index.html').on('response', function(res){

        grunt.log.writeln(res.statusCode);
        grunt.log.writeln(res.headers);
        res.on('data', function(chunk){
          test.equal(chunk.length, stat.size)
          test.done();
        });

      }).end();

    });
  }
};
