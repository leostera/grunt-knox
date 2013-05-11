/*
 * grunt-knox
 * https://github.com/leostera/grunt-knox
 *
 * Copyright (c) 2013 Leandro Ostera
 * Licensed under the MIT license.
 */

'use strict';

var knox  = require('intimidate')
  , async = require('async')
  , fs    = require('fs');

module.exports = function(grunt) {
  grunt.registerMultiTask('deploy', 'Deploy to Amazon S3', function() {
    var done = this.async();

    var options = this.options({
      force: false,
      saveTo: '/'
    });

    var done = this.async();

    grunt.verbose.writeflags(options, 'Options');

    var s3client = new knox({
        key: options.key
      , secret: options.secret
      , bucket: options.bucket
      , maxRetries: options.maxRetries || 4
      , backoffInterval: options.backoffInterval || 51
    });



    // Upload Logic.
    this.files.forEach(function(filePair) {
      grunt.verbose.writeln("filePair: ", filePair);

      function encode_file_name (path) {
        var path = path.split("/");
        var filename = path.pop();
        path.push( encodeURIComponent(filename));
        return path.join("/");
      }

      function strip_root_folder(path) {
        return path.split("/").slice(1).join("/");
      }

      function file_filter (filepath, cb) {
        if (!grunt.file.exists(filepath)) { return cb(false); }
        if (grunt.file.isDir(filepath)) { return cb(false); }
        return cb(true);
      }

      function file_map (filepath, cb) {
        fs.stat(filepath, function (err, stat) {
          if(err) return cb(err, null);
          var s3path = options.saveTo+encode_file_name(strip_root_folder(filepath));
          var obj = {
            src: filepath,
            dest: s3path,
            size: stat.size
          };
          return cb(null, obj);
        })
      }

      // FILTER the files
      async.filter(filePair.src, file_filter, function (validFiles) {
        grunt.verbose.writeln("FILTER");
        grunt.verbose.writeln("* files", validFiles);

        // MAP the stat and s3 paths
        async.map(validFiles, file_map, function(err, files){
          grunt.verbose.writeln("MAP");
          grunt.verbose.writeln("* errors: ", err);
          grunt.verbose.writeln("* files: ", files);

          // STACK the parallel function calls
          var parallel_calls = []

          s3client.uploadFiles(files, function (err, res) {
            if(err) {
              grunt.verbose.error(err);
            } else {
              grunt.verbose.writeln(res)
            }
            grunt.log.writeln("Finished!")
            done()
          });
        });
      });
    });
  });
};