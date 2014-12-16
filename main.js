var globby = require('globby');
var async = require('async');

module.exports = {

  lint: function (files, options, callback) {
    if (typeof options.limit === 'undefined') options.limit = 10;

    globby(files, function (err, paths) {
      async.eachLimit(paths, options.limit, function (item, cb) {
        // run on each file
        var child = exec('php -l '+item, {
          cwd: process.cwd(),
          env: process.env
        }, function (err, stdout, stderr) {
          // done on a single file
          cb(err);
        })
      }, function (err, stdout, stderr) {
        // all files are done or there was an error
        callback(err, stdout, stderr);
      });
    });
  },

  gruntPlugin: function (grunt) {
    grunt.task.registerMultiTask('phplint', 'Lint PHP files in parallel.', function() {
      var done = this.async();

      // Merge task-specific and/or target-specific options with these defaults.
      var options = this.options({
        stdout: true,
        stderr: true,
        limit: 10
      });

      var failed = 0;

      async.eachLimit(this.filesSrc, options.limit, function (item, callback) {
        // run on each file
        var child = exec('php -l '+item, {
          cwd: process.cwd(),
          env: process.env
        }, function (err, stdout, stderr) {
          // done on a single file
          if (err) failed++;
          callback(err);
        })
      }, function (err, stdout, stderr) {
        // all files are done or there was an error
        if (options.stdout) process.stdout.write(stdout);
        if (options.stderr) process.stderr.write(stderr);
        done(failed);
      });
    });
  }

};
