/*
 * grunt-knox
 * https://github.com/leostera/grunt-knox
 *
 * Copyright (c) 2013 Leandro Ostera
 * Licensed under the MIT license.
 */

'use strict';

var knox = require('knox')
  , fs   = require('fs');

module.exports = function(grunt) {
  grunt.registerMultiTask('deploy', 'Deploy to Amazon S3', function() {

    var options = this.options({
      force: false,
      saveTo: '/'
    });

    var done = this.async();

    grunt.verbose.writeflags(options, 'Options');

    var s3client = knox.createClient({
        key: options.key
      , secret: options.secret
      , bucket: options.bucket
    });

    this.filesSrc.forEach(function(filepath) {
      grunt.log.writeln("Uploading: ", filepath);

      if (!grunt.file.exists(filepath)) { return; }

      fs.stat(filepath, function(err, stat){

        if(err) {
          grunt.log.writeln(err);
          return;
        }
        
        var filename = filepath.split('/').pop();
        grunt.log.writeln("Stat OK. Proceeding to put "+filename+" in bucket.");

        var s3path = options.saveTo+filename;

        var req = s3client.put(s3path, {
            'Content-Length': stat.size
          , 'Content-Type': 'text/plain'
        });

        fs.createReadStream(filepath).pipe(req);

        req.on('response', function(res){
          done();
        });
      });
    });
  });
};