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
  , s3client = knox.createClient({
      key: "AKIAIKT3SJJUCJPOFCOQ",
      secret: "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",
      bucket: "grunt-knox"
    });

exports.deploy = {
  setUp: function(done) {
    done();
  },
  checkFileIsThere: function(test) {
    test.expect(1);

    fs.stat('./test/knox_test.gzip', function (err, stat) {

      if(err) {
        grunt.log.writeln("File test/knox_test.gzip couldn't be stat'd: ", err);
        test.done(false);
      }

      s3client.get('knox_test.gzip').on('response', function(res){

        grunt.log.writeln(res.statusCode);
        grunt.log.writeln(res.headers);
        res.on('data', function(chunk){
          test.equal(chunk.length, stat.size)
          test.done();
        });

      }).end();

    });
  },
};
