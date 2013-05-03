/*
 * grunt-knox
 * https://github.com/leostera/grunt-knox
 *
 * Copyright (c) 2013 Leandro Ostera
 * Licensed under the MIT license.
 */

'use strict';

var knox  = require('knox')
  , async = require('async')
  , _     = require('underscore')
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

    var s3client = knox.createClient({
        key: options.key
      , secret: options.secret
      , bucket: options.bucket
    });

    // Upload Logic.
    this.files.forEach(function(filePair) {
      grunt.verbose.write("filePair: ", filePair);

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
          var s3path = options.saveTo+strip_root_folder(filepath);
          var obj = {
            name: filepath,
            path: s3path,
            size: stat.size
          };
          return cb(null, obj);
        })
      }

      // FILTER the files
      async.filter(filePair.src, file_filter, function (validFiles) {
        grunt.verbose.write("");
        grunt.verbose.write("FILTER");
        grunt.verbose.write("* files", validFiles);

        // MAP the stat and s3 paths
        async.map(validFiles, file_map, function(err, files){
          grunt.verbose.write("");
          grunt.verbose.write("MAP");
          grunt.verbose.write("* errors: ", err);
          grunt.verbose.write("* files: ", files);
          grunt.verbose.write("");

          // STACK the parallel function calls
          var parallel_calls = []
          files.forEach(function (file) {
            parallel_calls.push(
              function (cb) {

                // PUT into S3 Bucket
                grunt.verbose.write("");
                grunt.verbose.write("PUSH file", file);
                var req = s3client.put(file.path, {
                    'Content-Length': file.size
                  , 'Content-Type': 'text/plain'
                });

                fs.createReadStream(file.name).pipe(req);

                // RETURN result object
                req.on('response', function (res) {
                  res = _.pick(res, "complete", "headers", "statusCode")
                  res.file = file.path;
                  var res_bool = null;

                  if(res.statusCode == 200) {
                    if(res.complete === false)
                      res.message = "Match!";
                    else
                      res.message = "Success!";
                  } else {
                    res_bool = false;
                    res.error = "HTTP Error: "+res.statusCode;
                  }


                  grunt.verbose.write("");
                  grunt.verbose.writeflags(res, "Response for "+file.name);

                  return cb(res_bool, res);
                });
              }
            )
          });
  
          // CALL PARALLEL FUNCTIONS
          async.parallel(parallel_calls, function (err, res) {
            grunt.verbose.write("");
            _.forEach(res, function (r) {
              grunt.log.writeln("File: ", r.file);
              if(err)
                grunt.log.writeln("* Error: ", r.error);
              else
                grunt.log.writeln("* Message: ", r.message);
            });
            done();
          });
        });
      });
    });
  });
};